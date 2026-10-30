/** Firebase callable errors should be actionable for players, not raw transport codes. */
export function socialActionError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code) : '';
  if (code === 'functions/not-found') {
    return 'Friends invitations are temporarily unavailable: the Firebase invitation service is not deployed or is in a different region. Please try again later.';
  }
  if (code === 'functions/failed-precondition')
    return 'This invitation has expired or cannot be used. Ask your friend for a new link.';
  if (code === 'functions/unauthenticated')
    return 'Sign in to Firebase before creating or accepting an invitation.';
  if (code === 'functions/permission-denied')
    return 'Invitation access denied. Check that app verification is enabled.';
  if (code === 'functions/unavailable')
    return 'Invitation service is unavailable. Check your connection and try again.';
  return error instanceof Error ? error.message : String(error);
}
