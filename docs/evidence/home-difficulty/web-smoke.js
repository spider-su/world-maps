// New isolated context; canonical v4 fixture, existing browser data untouched.
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 412, height: 915 } });
  const test = await context.newPage();
  const errors = [];
  test.on('pageerror', error => errors.push(error.message));
  const key = 'world-maps:hot-cold:progress:v1';
  const check = (value, message) => { if (!value) throw new Error(message); };
  await test.addInitScript(key => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      schemaVersion: 4, explorer: 'ocean', difficulty: 'difficult', practiceMode: 'adaptive',
      voiceEnabled: false, sessions: [], learning: {}, explored: [],
    }));
  }, key);
  try {
    await test.goto('http://127.0.0.1:8102');
    await test.getByRole('button', { name: 'Customize quiz', exact: true }).waitFor();
    check(!(await test.locator('body').innerText()).includes('Difficult'), 'Home exposes Difficulty');
    await test.screenshot({ path: 'docs/evidence/home-difficulty/web-home.png' });
    await test.getByRole('button', { name: 'Customize quiz', exact: true }).click();
    check(await test.getByRole('radiogroup', { name: 'Difficulty', exact: true }).count() === 0, 'Home setup duplicates Difficulty');
    await test.getByRole('radio', { name: 'Adaptive', exact: true }).waitFor();
    await test.screenshot({ path: 'docs/evidence/home-difficulty/web-home-setup.png' });
    await test.getByRole('button', { name: 'Close', exact: true }).click();
    await test.getByRole('tab', { name: /Maps/ }).click();
    await test.getByText(/Europe · Difficult · Adaptive/).waitFor();
    await test.getByRole('button', { name: 'Customize quiz', exact: true }).click();
    await test.getByRole('radiogroup', { name: 'Difficulty', exact: true }).waitFor();
    check(await test.getByRole('radio', { name: 'Difficult', exact: true }).getAttribute('aria-checked') === 'true', 'Saved difficulty was changed by hiding it');
    await test.screenshot({ path: 'docs/evidence/home-difficulty/web-map-setup.png' });
    await test.getByRole('radio', { name: 'Easy', exact: true }).click();
    await test.waitForFunction(key => JSON.parse(localStorage.getItem(key)).difficulty === 'easy', key);
    await test.getByRole('button', { name: 'Close', exact: true }).click();
    await test.getByRole('tab', { name: /Home/ }).click();
    await test.getByText(/^Europe · Adaptive\nFind It:/).waitFor(); // Maps stays mounted offscreen with its own summary
    await test.getByRole('button', { name: /^Name It\. Identify/ }).click();
    await test.getByRole('button', { name: 'Back to Home', exact: true }).waitFor();
    await test.getByRole('button', { name: 'Back to Home', exact: true }).click();
    await test.reload();
    await test.getByRole('tab', { name: /Maps/ }).click();
    await test.getByText(/Europe · Easy · Adaptive/).waitFor();
    check(errors.length === 0, errors.join('; '));
    return { pass: true, pageErrors: errors, checks: ['Home summary and setup omit Difficulty', 'Maps retains saved difficult choice', 'Maps can change difficulty', 'Home launches game', 'Maps choice survives reload'] };
  } finally { await context.close(); }
}
