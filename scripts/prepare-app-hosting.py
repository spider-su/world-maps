"""Validate successful main CI artifact before publishing; never publish a PR APK."""
import hashlib, json, pathlib, re, sys
root=pathlib.Path(__file__).resolve().parent.parent/'firebase/hosting'
metadata=json.loads((root/'downloads/preview-metadata.json').read_text())
if metadata['sourceCommit']!=sys.argv[2] or metadata['trackedChanges']:
 raise SystemExit('APK source does not match clean main CI source')
if hashlib.sha256((root/'downloads/world-maps-preview.apk').read_bytes()).hexdigest()!=metadata['sha256']:
 raise SystemExit('APK hash does not match metadata')
cert=re.search(r'Signer #1 certificate SHA-256 digest: ([a-fA-F0-9]{64})',pathlib.Path(sys.argv[1]).read_text())
if not cert:raise SystemExit('Missing verified APK signing certificate')
fingerprint=':'.join(cert[1][i:i+2].upper() for i in range(0,64,2))
association=[{'relation':['delegate_permission/common.handle_all_urls'],'target':{'namespace':'android_app','package_name':'com.spidersu.worldmaps','sha256_cert_fingerprints':[fingerprint]}}]
(root/'.well-known').mkdir(exist_ok=True)
(root/'.well-known/assetlinks.json').write_text(json.dumps(association,indent=2)+'\n')
