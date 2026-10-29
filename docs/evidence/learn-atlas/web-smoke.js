// Run with Playwright browser_run_code_unsafe against the local Expo web server.
// No storage reset. Forces photo failure, then restores real network requests for retry.
async (page) => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const shot = async name => { await page.waitForTimeout(350); await page.screenshot({path:`docs/evidence/learn-atlas/web-${name}.png`,animations:'disabled'}); };
  let photoRequests = 0;
  let blockPhotos = false;
  const routeHandler = async route => {
    if (new URL(route.request().url()).hostname.endsWith('wikimedia.org')) {
      photoRequests++;
      if (blockPhotos) return route.abort();
    }
    return route.continue();
  };
  await page.route('**/*',routeHandler);
  try {
    await page.goto('http://localhost:8081');
    await page.setViewportSize({width:412,height:915});
    await page.getByRole('button',{name:/^Learn\./}).click();
    check(await page.getByText('Tap a country to explore',{exact:true}).isVisible(),'Initial hint missing');
    await shot('start');
    await page.getByRole('button',{name:/^Zoom to nearby countries/}).first().click();
    check(await page.getByText('Tap a country to explore',{exact:true}).isVisible(),'Cluster tap selected a country');
    await page.getByRole('button',{name:'Back to Home',exact:true}).click();
    await page.getByRole('button',{name:/^Learn\./}).click();
    await page.getByRole('button',{name:'Germany',exact:true}).click();
    check(await page.getByText('Tap a country to explore',{exact:true}).count() === 0,'Hint survived selection');
    await page.getByRole('button',{name:'Germany. Country details',exact:true}).waitFor();
    check(photoRequests === 0,'Photos requested before opt-in');
    await shot('selected');
    await page.getByRole('button',{name:'Germany. Country details',exact:true}).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('heading',{name:'Germany',exact:true}).waitFor();
    for (const text of ['Country code','Map position','Physical atlas','Country details','Tap another country']) check(await dialog.getByText(text,{exact:true}).count() === 0,`Unwanted text: ${text}`);
    check(await dialog.getByText('Berlin',{exact:true}).isVisible(),'Capital missing');
    check(await dialog.getByText('Brandenburg Gate',{exact:true}).isVisible(),'Landmark missing');
    check(photoRequests === 0,'Opening details requested photos');
    await shot('details');
    blockPhotos = true;
    await dialog.getByRole('button',{name:'Show photos · Online',exact:true}).click();
    await dialog.getByText('Photo unavailable.',{exact:true}).first().waitFor();
    check(photoRequests > 0,'Gallery never requested photos');
    await shot('offline-photos');
    blockPhotos = false;
    const retryButtons = dialog.getByRole('button',{name:'Retry photo',exact:true});
    while (await retryButtons.count()) await retryButtons.first().click();
    await page.waitForFunction(() => Array.from(document.images).filter(i => i.src.includes('wikimedia.org')).some(i => i.complete && i.naturalWidth > 0));
    check(await dialog.getByRole('link',{name:/^Source & author/}).count() === 3,'Photo attribution missing');
    check(await dialog.getByRole('link',{name:/^CC BY/}).count() === 3,'License links missing');
    await dialog.locator('img').first().scrollIntoViewIfNeeded();
    await dialog.getByText('Berlin',{exact:true}).scrollIntoViewIfNeeded();
    await shot('photos');
    await page.setViewportSize({width:320,height:568});
    await dialog.getByRole('link',{name:/Read on Wikipedia/}).scrollIntoViewIfNeeded();
    const closeBox = await dialog.getByRole('button',{name:'Close',exact:true}).boundingBox();
    check(closeBox && closeBox.y >= 0 && closeBox.y+closeBox.height <= 568,'Close scrolled offscreen');
    await shot('small-details');
    await dialog.getByRole('button',{name:'Close',exact:true}).click();
    await dialog.waitFor({state:'hidden'});
    await page.setViewportSize({width:412,height:915});
    await page.getByRole('button',{name:'Back to Home',exact:true}).click();
    await page.getByRole('button',{name:/^Learn\./}).click();
    await page.getByRole('button',{name:'Germany',exact:true}).click();
    await page.getByRole('button',{name:'Germany. Country details',exact:true}).click();
    await page.getByRole('button',{name:'Show photos · Online',exact:true}).click();
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.getByRole('dialog').waitFor({state:'hidden'});
    await page.getByRole('button',{name:'Malta',exact:true}).click();
    await page.getByRole('button',{name:'Malta. Country details',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'Show photos · Online',exact:true}).waitFor();
    check(await page.getByRole('dialog').getByText('Known for',{exact:true}).count() === 0,'Invented landmark for Malta');
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.getByRole('dialog').waitFor({state:'hidden'});
    await page.getByRole('button',{name:'Back to Home',exact:true}).click();
    await page.getByRole('button',{name:/^Find It\./}).click();
    check(await page.getByRole('button',{name:/^Map country /}).count() > 0,'Quiz controls no longer anonymous');
    check(await page.getByRole('button',{name:'Germany',exact:true}).count() === 0,'Learn names leaked into quiz');
    await page.getByRole('button',{name:'Back to Home',exact:true}).click();
    return 'PASS: hint, cluster, essentials, opt-in, failure/retry, attribution, sticky Close, small country, gallery reset and quiz anonymity';
  } finally {
    await page.unroute('**/*',routeHandler);
  }
}
