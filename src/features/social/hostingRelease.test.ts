import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const commit='a'.repeat(40);
function prepare(options: { commit?:string; dirty?:boolean; hash?:string; certificate?:string }={}) {
 const dir=mkdtempSync(join(tmpdir(),'wm-hosting-'));
 try {
  const downloads=join(dir,'firebase/hosting/downloads');mkdirSync(downloads,{recursive:true});mkdirSync(join(dir,'scripts'));
  copyFileSync('scripts/prepare-app-hosting.py',join(dir,'scripts/prepare-app-hosting.py'));
  writeFileSync(join(downloads,'world-maps-preview.apk'),'fixture');
  writeFileSync(join(downloads,'preview-metadata.json'),JSON.stringify({sourceCommit:options.commit??commit,trackedChanges:options.dirty??false,sha256:options.hash??createHash('sha256').update('fixture').digest('hex')}));
  writeFileSync(join(dir,'cert.txt'),options.certificate??`Signer #1 certificate SHA-256 digest: ${'ab'.repeat(32)}`);
  const result=spawnSync('python3',[join(dir,'scripts/prepare-app-hosting.py'),join(dir,'cert.txt'),commit],{encoding:'utf8'});
  return {status:result.status,error:result.stderr,association:result.status===0?JSON.parse(readFileSync(join(dir,'firebase/hosting/.well-known/assetlinks.json'),'utf8')):null};
 } finally { rmSync(dir,{recursive:true,force:true}); }
}
describe('public app download provenance',()=>{
 it('generates Android association from the verified APK certificate',()=>{const r=prepare();expect(r.status).toBe(0);expect(r.association[0].target.package_name).toBe('com.spidersu.worldmaps');expect(r.association[0].target.sha256_cert_fingerprints).toEqual([Array(32).fill('AB').join(':')]);});
 it('refuses stale or modified CI sources',()=>{expect(prepare({commit:'b'.repeat(40)}).status).not.toBe(0);expect(prepare({dirty:true}).status).not.toBe(0);});
 it('refuses a tampered APK or missing signing certificate',()=>{expect(prepare({hash:'0'.repeat(64)}).status).not.toBe(0);expect(prepare({certificate:'missing'}).status).not.toBe(0);});
});
