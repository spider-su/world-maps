// Run with Playwright's browser_run_code tool against `npx expo start --web --port 8081`.
// Uses an isolated browser profile; never clears storage. Restores Normal after preference testing.
async (page) => {
  const check = (value, message) => { if (!value) throw new Error(message); };
  const shot = async name => { await page.getByRole('button', { name: 'Close', exact: true }).waitFor({ state: 'hidden' }); await page.screenshot({ path: `docs/evidence/compact-ui/web-${name}.png`, scale: 'css', animations: 'disabled' }); };
  await page.goto('http://localhost:8081');
  await page.setViewportSize({ width: 412, height: 915 });
  await page.getByRole('button', { name: 'Difficulty: Normal', exact: true }).waitFor();
  await shot('home');
  await page.getByRole('button', { name: 'Maps: Europe', exact: true }).click();
  for (const name of ['Europe','Asia','Africa','South America','Oceania']) {
    check(await page.getByRole('button', { name: new RegExp(`^${name} \\d+`) }).isVisible(), `Missing map ${name}`);
  }
  await page.getByRole('button', { name: /^Oceania 14/ }).click();
  check(await page.getByRole('button', { name: 'Maps: Oceania', exact: true }).isVisible(), 'Map selection did not apply');
  await page.getByRole('button', { name: 'Maps: Oceania', exact: true }).click();
  await page.getByRole('button', { name: /^Europe 47/ }).click();
  await page.getByRole('button', { name: 'Difficulty: Normal', exact: true }).click();
  await page.getByRole('radio', { name: 'Easy', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Difficulty: Easy', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Difficulty: Easy', exact: true }).click();
  await page.getByRole('radio', { name: 'Normal', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 568 });
  await shot('home-small');
  await page.getByRole('button', { name: /^Find It\./ }).click();
  check(await page.getByRole('tablist').count() === 0, 'Tabs must hide during play');
  check(await page.getByRole('button', { name: 'New round', exact: true }).count() === 0, 'Restart leaked into play dock');
  check(await page.getByRole('button', { name: 'Zoom in', exact: true }).count() === 0, 'Extra map tools visible by default');
  await page.getByRole('button', { name: 'Show whole map', exact: true }).click();
  await shot('find-small');
  await page.setViewportSize({ width: 412, height: 915 });
  await page.getByRole('button', { name: 'Play options', exact: true }).click();
  check(await page.getByRole('button', { name: 'Show names', exact: true }).count() === 0, 'Quiz target secrecy compromised');
  await page.getByRole('button', { name: 'Map tools', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.getByRole('button', { name: 'Move left', exact: true }).click();
  await page.getByRole('button', { name: 'Play options', exact: true }).click();
  await page.getByRole('button', { name: 'Map tools', exact: true }).click();
  await shot('find');
  await page.getByRole('button', { name: 'Back to Home', exact: true }).click();
  await page.getByRole('button', { name: /^Name It\./ }).click();
  const answers = page.locator('[role="button"]:not([aria-label])');
  check(await answers.count() === 4, 'Name It must offer four answers');
  await shot('name');
  const names = await answers.allTextContents();
  for (const name of names) {
    if (await page.getByRole('button', { name: 'Next country', exact: true }).count()) break;
    await page.getByRole('button', { name, exact: true }).click();
  }
  check(await answers.count() === 0, 'Completed answer choices must disappear');
  check(await page.getByRole('button', { name: 'Next country', exact: true }).isVisible(), 'Completion needs Next country');
  check(await page.getByRole('button', { name: 'Hear name', exact: true }).isVisible(), 'Completed target pronunciation missing');
  check(!((await page.locator('body').innerText()).includes('Which country is highlighted?')), 'Duplicate prompt after completion');
  await shot('complete');
  await page.getByRole('button', { name: 'Next country', exact: true }).click();
  check(await answers.count() === 4, 'Next country must start a fresh playable round');
  await page.getByRole('button', { name: 'Back to Home', exact: true }).click();
  await page.getByRole('button', { name: /^Hot & Cold\./ }).click();
  await shot('hot-cold');
  await page.getByRole('button', { name: 'Back to Home', exact: true }).click();
  await page.getByRole('button', { name: /^Learn\./ }).click();
  check(!((await page.locator('body').innerText()).includes('Best score')), 'Learn must remain unscored');
  await shot('learn');
  await page.getByRole('button', { name: 'Back to Home', exact: true }).click();
  return 'PASS: map chooser, difficulty persistence, 320px layout, hidden play tabs, overflow tools, answer secrecy, completion/Next/audio, four modes';
}
