import{createRequire}from'node:module';const require=createRequire(import.meta.url),{chromium}=require(process.env.WORLD_MAPS_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),results=[];try{for(const locale of ['en','pl','ru']){
 const ctx=await browser.newContext({viewport:{width:390,height:844},locale}),p=await ctx.newPage();
 const requests=[];p.on('request',r=>requests.push(r.url()));
 await p.goto('http://127.0.0.1:8116/friend?invite='+'a'.repeat(48));
 const link=await p.locator('#open').getAttribute('href');if(!link?.startsWith('worldmaps://friend?invite='))throw Error('No app link');
 // Serve only fixture metadata locally; the APK bytes are not claimed as a release.
 await p.route('**/downloads/world-maps-preview.apk',r=>r.fulfill({status:200,body:'fixture'}));
 await p.route('**/downloads/preview-metadata.json',r=>r.fulfill({json:{sourceCommit:'b'.repeat(40),sha256:'c'.repeat(64)}}));
 await p.reload();await p.locator('#download:not([aria-disabled])').waitFor();
 if(await p.locator('#download').getAttribute('href')!=='/downloads/world-maps-preview.apk')throw Error('Missing download');
 await p.screenshot({path:`docs/evidence/profile-sharing/landing-${locale}.png`});
 await p.goto('http://127.0.0.1:8116/friend?invite=invalid');if(await p.locator('#open').isVisible())throw Error('Invalid code opened app');
 if(requests.some(url=>!url.startsWith('http://127.0.0.1:8116')))throw Error('Landing leaked request');
 results.push(locale);await ctx.close();
}console.log(JSON.stringify({hostingRewrite:true,locales:results,downloadLink:true,invalidLinkRejected:true,noExternalRequests:true}));}finally{await browser.close();}
