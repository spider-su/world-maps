import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initialize, validateIdentity } from './init-app.mjs';

function fixture(env = 'APP_NAME=Template\nAPP_SLUG=template\n# ANDROID_PACKAGE=com.example.template\n# IOS_BUNDLE_IDENTIFIER=com.example.template\n') {
  const dir = mkdtempSync(join(tmpdir(), 'mobile-template-'));
  writeFileSync(join(dir, '.env.example'), env);
  writeFileSync(join(dir, 'package.json'), '{"name":"mobile-app-template","private":true}\n');
  return dir;
}

test('validates identifiers and unsafe app names', () => {
  assert.throws(() => validateIdentity('App', 'Bad Slug', 'com.example.app', 'com.example.app'));
  assert.throws(() => validateIdentity('App', 'app', 'invalid', 'com.example.app'));
  assert.throws(() => validateIdentity('App\nINJECT=1', 'app', 'com.example.app', 'com.example.app'));
});

test('configures a new app including commented identifiers and refuses overwrites', () => {
  const dir = fixture();
  try {
    const id = { name: 'My App', slug: 'my-app', androidPackage: 'com.example.myapp', iosBundleId: 'com.example.myapp' };
    initialize(dir, id);
    const env = readFileSync(join(dir, '.env'), 'utf8');
    assert.match(env, /^APP_NAME=My App$/m);
    assert.match(env, /^ANDROID_PACKAGE=com.example.myapp$/m);
    assert.match(env, /^IOS_BUNDLE_IDENTIFIER=com.example.myapp$/m);
    assert.match(env, /^APP_SLUG=my-app$/m);
    assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'my-app');
    assert.throws(() => initialize(dir, id), /already exists/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('invalid example is rejected without modifying package.json or creating .env', () => {
  const dir = fixture('APP_NAME=Template\nAPP_SLUG=template\nANDROID_PACKAGE=com.example.app\n');
  try {
    const original = readFileSync(join(dir, 'package.json'), 'utf8');
    assert.throws(() => initialize(dir, { name:'My App', slug:'my-app', androidPackage:'com.example.app', iosBundleId:'com.example.app' }), /Missing configuration key/);
    assert.equal(readFileSync(join(dir, 'package.json'), 'utf8'), original);
    assert.equal(existsSync(join(dir, '.env')), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
