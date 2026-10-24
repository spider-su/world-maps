import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateIdentity(name, slug, androidPackage, iosBundleId) {
  if (typeof name !== 'string' || !name.trim() || name.length > 60 || /[\r\n]/.test(name)) {
    throw new Error('App name must be 1–60 characters on one line');
  }
  if (typeof slug !== 'string' || !/^[a-z][a-z0-9-]*$/.test(slug)) {
    throw new Error('Slug must use lowercase letters, numbers and hyphens, starting with a letter');
  }
  for (const [label, id] of [['Android package', androidPackage], ['iOS bundle ID', iosBundleId]]) {
    if (typeof id !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(id)) {
      throw new Error(label + ' must be a reverse-domain identifier');
    }
  }
}

export function initialize(root, identity) {
  const { name, slug, androidPackage, iosBundleId } = identity;
  validateIdentity(name, slug, androidPackage, iosBundleId);
  const envPath = resolve(root, '.env');
  if (existsSync(envPath)) throw new Error('.env already exists; refusing to overwrite an existing app');

  const example = readFileSync(resolve(root, '.env.example'), 'utf8');
  const values = { APP_NAME: name, APP_SLUG: slug, ANDROID_PACKAGE: androidPackage, IOS_BUNDLE_IDENTIFIER: iosBundleId };
  const lines = example.split(/\r?\n/);
  for (const [key, value] of Object.entries(values)) {
    const index = lines.findIndex(line => new RegExp('^#?\\s*' + key + '=').test(line));
    if (index < 0) throw new Error('Missing configuration key: ' + key);
    lines[index] = key + '=' + value;
  }
  // Validate every field before writing any files.
  const packagePath = resolve(root, 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  pkg.name = slug;
  writeFileSync(envPath, lines.join('\n'), { flag: 'wx' });
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [name, slug, androidPackage, iosBundleId] = process.argv.slice(2);
  try {
    initialize(process.cwd(), { name, slug, androidPackage, iosBundleId });
    console.log('Configured ' + name + '. Review .env and run npm ci && npm run ci.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
