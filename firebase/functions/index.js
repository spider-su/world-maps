'use strict';
const crypto = require('node:crypto');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();
const TTL = 24 * 60 * 60 * 1000;
const validToken = token => typeof token === 'string' && /^[A-Za-z0-9_-]{32,128}$/.test(token);
const inviteId = token => crypto.createHash('sha256').update(token).digest('hex');
const uidFor = req => {
  if (!req.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in first');
  return req.auth.uid;
};

/** Returns one-time secret for QR/link; token itself is never stored in Firestore. */
exports.createFriendInvite = onCall({ maxInstances: 10, enforceAppCheck: true }, async req => {
  const uid = uidFor(req);
  const token = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  await db.doc(`friendInvites/${inviteId(token)}`).create({
    owner: uid, createdAt: now, expiresAt: now + TTL
  });
  return { token, expiresAt: now + TTL };
});

/** One-time, atomic accept. Mutual relationship is written by a trusted identity. */
exports.acceptFriendInvite = onCall({ maxInstances: 10, enforceAppCheck: true }, async req => {
  const uid = uidFor(req);
  const token = req.data?.token;
  if (!validToken(token)) throw new HttpsError('invalid-argument', 'Invalid invitation');
  const ref = db.doc(`friendInvites/${inviteId(token)}`);
  await db.runTransaction(async tx => {
    const invite = await tx.get(ref);
    if (!invite.exists) throw new HttpsError('not-found', 'Invitation unavailable');
    const { owner, expiresAt } = invite.data();
    if (typeof owner !== 'string' || !Number.isFinite(expiresAt) || Date.now() >= expiresAt)
      throw new HttpsError('failed-precondition', 'Invitation expired');
    if (owner === uid) throw new HttpsError('failed-precondition', 'Cannot add yourself');
    tx.create(db.doc(`users/${owner}/friends/${uid}`), { createdAt: FieldValue.serverTimestamp() });
    tx.create(db.doc(`users/${uid}/friends/${owner}`), { createdAt: FieldValue.serverTimestamp() });
    tx.delete(ref);
  });
  return { accepted: true };
});

/** Unlink both sides even when one member initiated the action. */
exports.removeFriend = onCall({ maxInstances: 10, enforceAppCheck: true }, async req => {
  const uid = uidFor(req);
  const friendUid = req.data?.friendUid;
  if (typeof friendUid !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(friendUid) || friendUid === uid)
    throw new HttpsError('invalid-argument', 'Invalid friend');
  const batch = db.batch();
  batch.delete(db.doc(`users/${uid}/friends/${friendUid}`));
  batch.delete(db.doc(`users/${friendUid}/friends/${uid}`));
  await batch.commit();
  return { removed: true };
});

/** Unused invitations can be cancelled by owner. */
exports.revokeFriendInvite = onCall({ maxInstances: 10, enforceAppCheck: true }, async req => {
  const uid = uidFor(req);
  const token = req.data?.token;
  if (!validToken(token)) throw new HttpsError('invalid-argument', 'Invalid invitation');
  const ref = db.doc(`friendInvites/${inviteId(token)}`);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (snap.exists && snap.data().owner !== uid) throw new HttpsError('permission-denied', 'Not your invitation');
    if (snap.exists) tx.delete(ref);
  });
  return { revoked: true };
});
