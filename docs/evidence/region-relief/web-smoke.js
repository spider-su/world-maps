// Uses an isolated context; no existing settings or progress are touched.
async page => {
  const context = await page.context().browser().newContext({ viewport: { width: 412, height: 915 } });
  const test = await context.newPage();
  const errors = [];
  test.on('pageerror', error => errors.push(error.message));
  await test.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const check = (value, detail) => { if (!value) throw new Error(detail); };
  const regions = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];
  let selected = 'Europe';
  let relief;
  const select = async name => {
    await test.getByRole('button', { name: `Maps: ${selected}`, exact: true }).click();
    await test.getByRole('button', { name: new RegExp('^'+name+'\\b') }).click();
    selected = name;
    await test.waitForTimeout(400); // allow chooser dismiss animation before screenshots
  };
  try {
    await test.goto('http://127.0.0.1:8104');
    await test.getByRole('tab', { name: /Maps/ }).click();
    for (const name of regions) {
      if (name !== selected) await select(name);
      const svg = test.locator(`svg[aria-label="${name}"]`);
      await svg.scrollIntoViewIfNeeded();
      const images = svg.locator('image');
      check(await images.count() === 2, `${name} lacks shared relief layers`);
      const href = await images.first().getAttribute('href');
      check(href.includes('world-blue-marble'), `${name} uses a different relief asset`);
      relief ??= href;
      check(href === relief, `${name} differs from Europe`);
      await test.screenshot({ path: `docs/evidence/region-relief/web-${name.toLowerCase().replaceAll(' ', '-')}.png` });
    }
    await select('Europe');
    await test.getByRole('button', { name: 'Explore this map', exact: true }).click();
    await test.getByRole('button', { name: 'France', exact: true }).focus();
    await test.getByRole('button', { name: 'France', exact: true }).press('Enter');
    await test.getByText(/^Paris ·/).waitFor();
    await test.screenshot({ path: 'docs/evidence/region-relief/web-europe-learn.png' });
    check((await test.locator('svg[aria-label="Europe"]').first().locator('image').first().getAttribute('href')) === relief, 'Learn differs from Maps preview');
    await test.getByRole('button', { name: 'Back to Home', exact: true }).click();
    await test.getByRole('button', { name: /^Name It\. Identify/ }).click();
    check(await test.locator('svg[aria-label="Europe"]').first().locator('image').count() === 0, 'Quiz gained terrain imagery');
    await test.getByRole('button', { name: 'Back to Home', exact: true }).click();
    await test.emulateMedia({ colorScheme: 'dark' });
    await test.reload();
    await test.getByRole('tab', { name: /Maps/ }).click();
    await test.screenshot({ path: 'docs/evidence/region-relief/web-europe-dark.png' });
    check(errors.length === 0, errors.join('; '));
    return { pass: true, pageErrors: errors, checks: ['same bundled relief for all six Maps previews', 'Europe Learn matches preview', 'France remains selectable', 'quiz fills unchanged', 'dark preview', 'external requests blocked'] };
  } finally { await context.close(); }
}
