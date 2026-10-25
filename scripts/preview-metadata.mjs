import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const apk = 'artifacts/world-maps-preview.apk';
const metadata = {
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  trackedChanges: execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim() !== '',
  sha256: createHash('sha256').update(readFileSync(apk)).digest('hex'),
  architectures: process.env.WORLD_MAPS_ARCHITECTURES ?? 'arm64-v8a,x86_64',
  embeddedJavaScript: true,
  signing: 'Development signing from generated Android project; not store credentials',
};
writeFileSync('artifacts/preview-metadata.json', `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Standalone preview: ${apk}\nSource: ${metadata.sourceCommit}\nSHA-256: ${metadata.sha256}`);
