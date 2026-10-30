// Serve artifacts/globe-pin-web on loopback port 8113. Isolated storage only.
async(page)=>{
 const ctx=await page.context().browser().newContext({viewport:{width:390,height:844}});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 await ctx.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8113')||r.request().url().startsWith('data:')?r.continue():r.abort());
 await p.addInitScript(()=>{
  localStorage.setItem('world-maps:map-quiz:v1',JSON.stringify({mapId:'europe',findClue:'name',nameAnswer:'country'}));
  localStorage.setItem('world-maps:hot-cold:progress:v1',JSON.stringify({schemaVersion:4,sessions:[],voiceEnabled:false,difficulty:'normal',explorer:'amber',explored:[],learning:{},practiceMode:'adaptive'}));
 });
 try{
  await p.goto('http://127.0.0.1:8113');await p.getByRole('button',{name:'Explore the globe',exact:true}).click();
  const surface=p.getByTestId('globe-surface'),land=p.getByTestId('globe-land');
  const original=await p.evaluate(()=>localStorage.getItem('world-maps:hot-cold:progress:v1'));
  const box=await surface.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
  const initial=await land.getAttribute('d');
  await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+70,y+15,{steps:8});await p.mouse.move(x,y,{steps:8});await p.mouse.up();
  check(!await p.getByRole('button',{name:'Close',exact:true}).count(),'Drag opened a sheet');
  await p.getByRole('button',{name:'Centre globe on selected region',exact:true}).click();
  await p.mouse.click(box.x+2,box.y+2);check(!await p.getByRole('button',{name:'Close',exact:true}).count(),'Outside sphere selected');
  // Berlin projected onto the Europe-centred orthographic globe.
  const rad=Math.PI/180,dl=(13.4-20)*rad,lat=52.5*rad,centre=48*rad;
  const gx=100+92*Math.cos(lat)*Math.sin(dl),gy=100-92*(Math.cos(centre)*Math.sin(lat)-Math.sin(centre)*Math.cos(lat)*Math.cos(dl));
  await p.mouse.click(box.x+box.width*gx/200,box.y+box.height*gy/200);
  await p.getByRole('heading',{name:'Germany',exact:true}).waitFor();await p.getByRole('button',{name:'Hide photos',exact:true}).waitFor();
  await p.waitForTimeout(500);
  await p.screenshot({path:'docs/evidence/globe-pin/web-country.png'});
  await p.getByRole('button',{name:'Close',exact:true}).click();await p.waitForTimeout(400);check(await p.getByTestId('globe-pin').count()===1,'Missing pin');
  const pin=await p.getByTestId('globe-pin').getAttribute('transform');
  await p.getByRole('button',{name:'Rotate globe east',exact:true}).click();await p.waitForTimeout(100);
  check(pin!==await p.getByTestId('globe-pin').getAttribute('transform'),'Pin failed to rotate');
  await p.getByRole('button',{name:'Centre globe on selected region',exact:true}).click();
  await surface.focus();for(let i=0;i<3;i++){await p.keyboard.press('ArrowDown');await p.waitForTimeout(50);}for(let i=0;i<2;i++){await p.keyboard.press('ArrowLeft');await p.waitForTimeout(50);}
  await p.keyboard.press('Enter');await p.getByText('Ocean or area outside the country collection',{exact:true}).waitFor();
  await p.screenshot({path:'docs/evidence/globe-pin/web-ocean.png'});await p.getByRole('button',{name:'Close',exact:true}).click();await p.waitForTimeout(400);
  await surface.hover();const before=await land.getAttribute('d');await p.mouse.wheel(0,100);await p.waitForTimeout(100);check(before!==await land.getAttribute('d'),'Wheel failed');
  check(original===await p.evaluate(()=>localStorage.getItem('world-maps:hot-cold:progress:v1')),'Globe changed progress');
  check(initial.length>100&&errors.length===0,errors.join(';'));
  return{country:'Germany',tap:true,dragGuard:true,outsideGuard:true,pinRotates:true,keyboardOcean:true,wheel:true,progressUnchanged:true,errors};
 }finally{await ctx.close();}
}
