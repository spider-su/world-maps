// New isolated context; never modifies existing browser/app data.
async page => {
  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 } });
  const test = await context.newPage();
  const errors = [];
  test.on('pageerror', error => errors.push(error.message));
  const key = 'world-maps:hot-cold:progress:v1';
  const fixture = { schemaVersion: 4, explorer: 'ocean', difficulty: 'normal', practiceMode: 'adaptive', voiceEnabled: false,
    explored: ['POL'], sessions: [{ packId: 'europe-countries', targetId: 'POL', guesses: ['POL'], startedAt: 1, completedAt: 2, score: 100 }],
    learning: { 'europe-countries': { POL: { correct: 1, incorrect: 0, firstTry: 1, lastPracticed: 2, recent: [true], lastRound: 1, lastGuesses: ['POL'] } } } };
  await test.addInitScript(({ key, fixture }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(fixture));
  }, { key, fixture });
  const check = (value, detail) => { if (!value) throw new Error(detail); };
  const open = async () => {
    await test.getByRole('tab', { name: /Profile/ }).click();
    await test.getByRole('button', { name: 'Your explorer', exact: true }).click();
  };
  const hair = () => test.getByRole('radiogroup', { name: 'Hair colour', exact: true });
  const eyes = () => test.getByRole('radiogroup', { name: 'Eye colour', exact: true });
  const saved = () => test.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  const shot = async name => {
    await test.screenshot({ path: `docs/evidence/explorer-colours/web-${name}.png` });
  };
  try {
    await test.goto('http://127.0.0.1:8103');
    await open();
    check(await hair().getByRole('radio', { name: 'Original', exact: true }).getAttribute('aria-checked') === 'true', 'Old profile changed hair');
    check(await eyes().getByRole('radio', { name: 'Original', exact: true }).getAttribute('aria-checked') === 'true', 'Old profile changed eyes');
    await hair().getByRole('radio', { name: 'Red', exact: true }).click();
    await eyes().getByRole('radio', { name: 'Green', exact: true }).click();
    const preview = test.getByRole('img', { name: 'Your character', exact: true });
    check(await preview.locator('path[fill="#A4482D"]').count() > 0, 'Hair preview did not change');
    check(await preview.locator('circle[fill="#34734C"]').count() === 2, 'Eye preview did not change');
    await shot('editor');
    await test.waitForFunction(key => JSON.parse(localStorage.getItem(key)).explorerAppearance?.eyes === 'green', key);
    const customized = await saved();
    const { explorerAppearance, ...unchanged } = customized;
    check(Object.entries(fixture).every(([field, value]) => JSON.stringify(unchanged[field]) === JSON.stringify(value)), 'Appearance edit changed existing facts');
    check(explorerAppearance.hair === 'red', 'Rapid changes lost hair');
    await test.getByRole('radio', { name: 'Forest', exact: true }).click();
    check(await eyes().getByRole('radio', { name: 'Green', exact: true }).getAttribute('aria-checked') === 'true', 'Base character changed colour choices');
    await test.getByRole('button', { name: 'Close', exact: true }).click();
    await test.getByText('30 XP', { exact: true }).waitFor();
    await test.reload();
    await open();
    check(await hair().getByRole('radio', { name: 'Red', exact: true }).getAttribute('aria-checked') === 'true', 'Hair did not survive reload');
    check(await eyes().getByRole('radio', { name: 'Green', exact: true }).getAttribute('aria-checked') === 'true', 'Eyes did not survive reload');
    await test.evaluate(key => {
      const original = Storage.prototype.setItem;
      window.restoreWrite = () => { Storage.prototype.setItem = original; };
      Storage.prototype.setItem = function(k, value) {
        if (k === key) throw new Error('Injected save failure');
        return original.call(this, k, value);
      };
    }, key);
    await hair().getByRole('radio', { name: 'Blond', exact: true }).click();
    const failure = test.getByText('Your latest changes are not saved on this device.', { exact: true }).last();
    await failure.waitFor();
    await failure.scrollIntoViewIfNeeded();
    await shot('save-error');
    check(await hair().getByRole('radio', { name: 'Blond', exact: true }).getAttribute('aria-checked') === 'true', 'Save error reverted live choice');
    await test.evaluate(() => window.restoreWrite());
    await test.getByRole('button', { name: 'Retry', exact: true }).last().click();
    await failure.waitFor({ state: 'hidden' });
    check((await saved()).explorerAppearance.hair === 'blond', 'Retry lost latest appearance');
    await hair().getByRole('radio', { name: 'Original', exact: true }).click();
    await test.waitForFunction(key => {
      const appearance = JSON.parse(localStorage.getItem(key)).explorerAppearance;
      return !appearance.hair && appearance.eyes === 'green';
    }, key);
    await test.getByRole('button', { name: 'Close', exact: true }).click();
    await test.setViewportSize({ width: 320, height: 568 });
    await test.emulateMedia({ colorScheme: 'dark' });
    await test.evaluate(() => localStorage.setItem('world-maps:language:v1', 'pl'));
    await test.reload();
    await test.getByRole('tab', { name: /Profil/ }).click();
    await test.getByRole('button', { name: 'Twój odkrywca', exact: true }).click();
    const blue = test.getByRole('radiogroup', { name: 'Kolor oczu', exact: true }).getByRole('radio', { name: 'Niebieski', exact: true });
    await blue.click();
    await shot('compact-pl-dark');
    await test.getByRole('button', { name: 'Zamknij', exact: true }).click();
    await test.evaluate(() => localStorage.setItem('world-maps:language:v1', 'ru'));
    await test.reload();
    await test.getByRole('tab', { name: /Профиль/ }).click();
    await test.getByRole('button', { name: 'Твой исследователь', exact: true }).click();
    const red = test.getByRole('radiogroup', { name: 'Цвет волос', exact: true }).getByRole('radio', { name: 'Рыжий', exact: true });
    await red.click();
    await shot('compact-ru-dark');
    await test.getByRole('button', { name: 'Закрыть', exact: true }).click();
    const confirmed = await saved();
    await test.evaluate(() => localStorage.setItem('world-maps:language:v1', 'en'));
    await test.addInitScript(key => {
      const original = Storage.prototype.getItem;
      window.restoreRead = () => { Storage.prototype.getItem = original; };
      Storage.prototype.getItem = function(k) {
        if (k === key) throw new Error('Injected read failure');
        return original.call(this, k);
      };
    }, key);
    await test.reload();
    await test.getByRole('tab', { name: /Profile/ }).click();
    await test.getByText('Saved progress could not be read. Retry before playing.', { exact: true }).last().waitFor();
    check(await test.getByRole('button', { name: 'Your explorer', exact: true }).count() === 0, 'Read error allowed edits');
    await test.evaluate(() => window.restoreRead());
    check(JSON.stringify(await saved()) === JSON.stringify(confirmed), 'Read error overwrote confirmed profile');
    await test.getByRole('button', { name: 'Retry', exact: true }).last().click();
    await test.getByRole('button', { name: 'Your explorer', exact: true }).waitFor();
    check(errors.length === 0, errors.join('; '));
    return { pass: true, pageErrors: errors, checks: ['old v4 defaults', 'live SVG hair/eyes', 'rapid edits and reload', 'character switch retains colours', 'existing facts and XP unchanged', 'save failure/retry', 'independent Original reset', 'PL/RU compact dark controls', 'read error blocks editing without data loss'] };
  } finally { await context.close(); }
}
