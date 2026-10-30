// Production export served on loopback port 8112; isolated fixture contexts only.
async(page)=>{
 const errors=[],results=[];const browser=page.context().browser();
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 async function open(mapId,extra={}){
  const ctx=await browser.newContext({viewport:{width:390,height:844},...extra});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  await ctx.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8112')||r.request().url().startsWith('data:')?r.continue():r.abort());
  await p.addInitScript(mapId=>{
   localStorage.setItem('world-maps:map-quiz:v1',JSON.stringify({mapId,findClue:'name',nameAnswer:'country'}));
   localStorage.setItem('world-maps:hot-cold:progress:v1',JSON.stringify({schemaVersion:4,sessions:[],voiceEnabled:false,difficulty:'difficult',explorer:'amber',explored:[],learning:{},practiceMode:'adaptive'}));
   if(mapId==='north-america')Math.random=()=>15.1/23; // Barbados is the first target, without exposing it in the UI.
  },mapId);
  await p.goto('http://127.0.0.1:8112');return{ctx,p};
 }
 const shot=async(p,name)=>{await p.waitForTimeout(350);await p.screenshot({path:'docs/evidence/map-framing/'+name+'.png'});};
 for(const mapId of ['europe','asia','africa','north-america','south-america','oceania']){
  const{ctx,p}=await open(mapId);
  try{
   await p.getByRole('button',{name:/Learn\./}).click();await shot(p,'web-'+mapId+'-learn');
   const initial=await p.getByTestId('continent-map').getAttribute('viewBox');
   await p.getByRole('button',{name:'Zoom in',exact:true}).click();check(initial!==await p.getByTestId('continent-map').getAttribute('viewBox'),mapId+' zoom failed');
   await p.getByRole('button',{name:'Show whole map',exact:true}).click();const whole=await p.getByTestId('continent-map').getAttribute('viewBox');
   await p.getByRole('button',{name:'Main view',exact:true}).click();check(initial===await p.getByTestId('continent-map').getAttribute('viewBox'),mapId+' reset failed');
   const insets=await p.locator('[data-testid^=region-inset-]').count();results.push({mapId,initial,whole,insets});
   if(mapId==='north-america'){
    await p.getByRole('button',{name:'Expand regional map: Caribbean',exact:true}).click();
    const detail=p.getByTestId('region-detail-caribbean').locator('svg');const beforeZoom=await detail.getAttribute('viewBox');await p.getByRole('button',{name:'Zoom in: Caribbean',exact:true}).click();check(beforeZoom!==await detail.getAttribute('viewBox'),'Regional zoom failed');await p.getByRole('button',{name:'Zoom in: Caribbean',exact:true}).click();const zoomed=await detail.getAttribute('viewBox');const box=await detail.boundingBox();await p.mouse.move(box.x+box.width*.6,box.y+box.height*.6);await p.mouse.down();await p.mouse.move(box.x+box.width*.6-80,box.y+box.height*.6-30,{steps:8});await p.mouse.up();await p.waitForTimeout(150);check(zoomed!==await detail.getAttribute('viewBox'),'Regional drag failed');await shot(p,'web-caribbean-zoom-drag');await p.getByRole('button',{name:'Show whole map: Caribbean',exact:true}).click();check(beforeZoom===await detail.getAttribute('viewBox'),'Regional reset failed');
    await p.getByTestId('region-choices-caribbean').getByRole('button',{name:'Barbados',exact:true}).click();
    await p.getByRole('button',{name:'Barbados. Country details',exact:true}).waitFor();await shot(p,'web-caribbean-selection');
    const progress=await p.evaluate(()=>JSON.parse(localStorage.getItem('world-maps:hot-cold:progress:v1')));check(progress.explored.includes('BRB')&&progress.sessions.length===0,'Learn inset wrote wrong progress');
    await p.getByTestId('continent-map').getByRole('button',{name:'Cuba',exact:true}).press('Enter');await p.getByRole('button',{name:'Cuba. Country details',exact:true}).waitFor();
    await p.getByRole('button',{name:'Back to Home',exact:true}).click();await p.getByRole('button',{name:/Name It\./}).click();
    await p.getByRole('button',{name:'Expand regional map: Caribbean',exact:true}).click();
    check(await p.getByTestId('region-choices-caribbean').getByRole('button').count()===0,'Name It inset showed answer controls');
    check(!(await p.getByTestId('region-choices-caribbean').innerText()).includes('Barbados') && !(await p.getByTestId('region-detail-caribbean').textContent()).includes('Barbados'),'Name It region leaked answer');await shot(p,'web-caribbean-quiz');
    await p.getByRole('button',{name:'Close',exact:true}).click();await p.getByRole('button',{name:'Barbados',exact:true}).click();await p.getByRole('button',{name:'Next country',exact:true}).waitFor();
   }
   if(mapId==='oceania'){
    await p.getByRole('button',{name:'Expand regional map: Micronesia',exact:true}).click();await p.getByTestId('region-choices-micronesia').getByRole('button',{name:'Palau',exact:true}).click();await p.getByRole('button',{name:'Palau. Country details',exact:true}).waitFor();
    await p.getByRole('button',{name:'Expand regional map: South Pacific',exact:true}).click();await p.getByTestId('region-choices-south-pacific').getByRole('button',{name:'Tonga',exact:true}).click();await p.getByRole('button',{name:'Tonga. Country details',exact:true}).waitFor();
   }
  }finally{await ctx.close();}
 }
 for(const[mapId,lang]of[['north-america','pl'],['oceania','ru']]){
  const{ctx,p}=await open(mapId,{viewport:{width:320,height:568},colorScheme:'dark',reducedMotion:'reduce'});
  try{await p.evaluate(lang=>localStorage.setItem('world-maps:language:v1',lang),lang);await p.reload();await p.getByRole('button',{name:lang==='pl'?/^Nauka\./:/^Изучение\./}).click();await shot(p,'web-'+mapId+'-'+lang+'-small-dark');await p.locator('[data-testid^=region-inset-]').first().click();await shot(p,'web-'+mapId+'-'+lang+'-sheet');}finally{await ctx.close();}
 }
 check(errors.length===0,errors.join('; '));return{results,errors};
}
