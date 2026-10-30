// Run against the production export served on loopback port 8111.
async (page) => {
 const context=await page.context().browser().newContext({viewport:{width:390,height:844}});
 const test=await context.newPage();const errors=[],targets=[];test.on('pageerror',e=>errors.push(e.message));
 const key='world-maps:hot-cold:progress:v1';
 await test.addInitScript(key=>{
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({schemaVersion:4,sessions:[],voiceEnabled:false,difficulty:'normal',explorer:'amber',explored:[],learning:{},practiceMode:'adaptive'}));
  localStorage.setItem('world-maps:map-quiz:v1',JSON.stringify({mapId:'north-america',findClue:'mixed',nameAnswer:'country'}));
 },key);
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 const solve=async()=>{
  for(let i=0;i<4&&!await test.getByRole('button',{name:'Next country',exact:true}).count();i++)await test.locator('button:not([aria-label]):not([disabled])').first().click();
  await test.getByRole('button',{name:'Next country',exact:true}).waitFor();
  const sessions=await test.evaluate(key=>JSON.parse(localStorage.getItem(key)).sessions,key);
  const id=sessions.at(-1).targetId;
  check(!targets.slice(-4).includes(id),'Recent target repeated: '+id);targets.push(id);
 };
 try {
  await test.goto('http://127.0.0.1:8111');await test.getByRole('button',{name:/Name It\./}).click();
  for(let i=0;i<32;i++){await solve();if(i<31)await test.getByRole('button',{name:'Next country',exact:true}).click();}
  check(new Set(targets).size>7,'Run stayed inside the old tiny pool');
  await test.waitForTimeout(350);await test.screenshot({path:'docs/evidence/quiz-variety/web-result.png'});
  await test.reload();await test.getByRole('button',{name:/Name It\./}).click();await solve();
  await test.getByRole('button',{name:'Back to Home',exact:true}).first().click();await test.getByRole('tab',{name:/Settings/}).click();
  await test.getByRole('button',{name:'Quiz setup',exact:true}).click();await test.getByText('16/23 · Learn includes every country on this map.',{exact:true}).waitFor();
  await test.waitForTimeout(350);await test.screenshot({path:'docs/evidence/quiz-variety/web-pool.png'});
  await test.getByRole('button',{name:'Close',exact:true}).click();await test.getByRole('tab',{name:/Home/}).click();await test.getByRole('button',{name:/Find It\./}).click();await test.getByRole('button',{name:'Play options',exact:true}).click();
  check((await test.locator('body').innerText()).includes('Normal · 16/23 countries'),'Game options had stale pool count');
  await test.waitForTimeout(350);await test.screenshot({path:'docs/evidence/quiz-variety/web-game-options.png'});
  check(errors.length===0,errors.join('; '));return {rounds:targets.length,unique:new Set(targets).size,targets,errors};
 }finally{await context.close();}
}
