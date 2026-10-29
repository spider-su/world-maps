// Run with the Playwright tool against a production export served on port 8101.
// A new isolated context owns the fixture and injected failures.
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 412, height: 915 } });
  const test = await context.newPage();
  const errors = [];
  test.on('pageerror', error => errors.push(error.message));
  const key = '@world-maps/music';
  const saved = { enabled: true, effectsEnabled: true, volume: 20 };
  const message = 'Music preferences could not be loaded or saved.';
  const check = (condition, detail) => { if (!condition) throw new Error(detail); };
  await test.addInitScript(({ key, saved }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(saved));
    const original = Storage.prototype.getItem;
    window.restoreRead = () => { Storage.prototype.getItem = original; };
    Storage.prototype.getItem = function(k) {
      if (k === key) throw new Error('Injected audio read failure');
      return original.call(this, k);
    };
  }, { key, saved });
  try {
    await test.goto('http://127.0.0.1:8101');
    await test.getByRole('tab', { name: /Settings/ }).click();
    const music = test.getByRole('switch', { name: 'Background music', exact: true });
    const effects = test.getByRole('switch', { name: 'Quiz sound effects', exact: true });
    await test.getByText(message, { exact: true }).waitFor();
    check(await music.isDisabled(), 'Read failure allowed audio edits');
    check(await test.getByRole('slider', { name: 'Volume', exact: true }).isDisabled(), 'Read failure allowed slider edits');
    await test.screenshot({ path: 'docs/evidence/volume-slider/web-read-error.png' });
    await test.evaluate(() => window.restoreRead());
    check(JSON.stringify(await test.evaluate(key => JSON.parse(localStorage.getItem(key)), key)) === JSON.stringify(saved), 'Read failure overwrote saved settings');
    await test.getByRole('button', { name: 'Retry', exact: true }).click();
    await test.getByText(message, { exact: true }).waitFor({ state: 'hidden' });
    check(await music.isChecked() && await effects.isChecked(), 'Read retry lost enabled preferences');
    await test.getByText('Volume: 20%', { exact: true }).waitFor();
    const slider = test.getByRole('slider', { name: 'Volume', exact: true });
    await slider.focus();
    await slider.press('ArrowRight');
    await test.getByText('Volume: 21%', { exact: true }).waitFor();
    await slider.press('Home');
    await test.getByText('Volume: 0%', { exact: true }).waitFor();
    await slider.press('End');
    await test.getByText('Volume: 30%', { exact: true }).waitFor();
    const track = await slider.boundingBox();
    await test.mouse.move(track.x + track.width * 0.4, track.y + track.height / 2);
    await test.mouse.down();
    await test.mouse.move(track.x + track.width * 0.78, track.y + track.height / 2, { steps: 12 });
    await test.mouse.up();
    check(Number(await slider.inputValue()) > 20, 'Pointer drag did not adjust volume');
    await test.screenshot({ path: 'docs/evidence/volume-slider/web-drag.png' });
    await slider.fill('20');
    await test.evaluate(key => {
      const original = Storage.prototype.setItem;
      window.restoreWrite = () => { Storage.prototype.setItem = original; };
      Storage.prototype.setItem = function(k, value) {
        if (k === key) throw new Error('Injected audio write failure');
        return original.call(this, k, value);
      };
    }, key);
    await test.getByRole('slider', { name: 'Volume', exact: true }).fill('30');
    await test.getByText(message, { exact: true }).waitFor();
    await test.getByText('Volume: 30%', { exact: true }).waitFor();
    check(await slider.isDisabled(), 'Save failure allowed slider edits');
    await test.screenshot({ path: 'docs/evidence/volume-slider/web-save-error.png' });
    await test.evaluate(() => window.restoreWrite());
    await test.getByRole('button', { name: 'Retry', exact: true }).click();
    await test.getByText(message, { exact: true }).waitFor({ state: 'hidden' });
    await music.click();
    await effects.click();
    await test.getByRole('slider', { name: 'Volume', exact: true }).fill('10');
    await test.waitForFunction(key => {
      const value = JSON.parse(localStorage.getItem(key));
      return value.enabled === false && value.effectsEnabled === false && value.volume === 10;
    }, key);
    await test.reload();
    await test.getByRole('tab', { name: /Settings/ }).click();
    await test.getByText(message, { exact: true }).waitFor(); // injected read on every document load
    await test.evaluate(() => window.restoreRead());
    await test.getByRole('button', { name: 'Retry', exact: true }).click();
    await test.getByText(message, { exact: true }).waitFor({ state: 'hidden' });
    check(!await music.isChecked() && !await effects.isChecked(), 'Relaunch lost independent toggles');
    await test.getByText('Volume: 10%', { exact: true }).waitFor();
    check(await test.getByRole('slider', { name: 'Volume', exact: true }).inputValue() === '10', 'Restored thumb differs from saved volume');
    await test.screenshot({ path: 'docs/evidence/volume-slider/web-restored.png' });
    check(errors.length === 0, 'Unexpected browser errors: ' + errors.join('; '));
    return { pass: true, pageErrors: errors, checks: ['slider pointer drag and keyboard arrows/Home/End', 'restored thumb matches saved volume', 'read failure blocks edits and preserves data', 'retry restores enabled toggles and volume', 'save failure retains chosen volume', 'retry saves latest preferences', 'rapid independent edits survive reload'] };
  } finally { await context.close(); }
}
