"""Run --baseline before install -r, then without arguments on the fresh APK."""
import json
import pathlib
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent
STATE = pathlib.Path('artifacts/explorer-colours-native-state.json')
ADB = ['adb', '-s', 'emulator-5554']
PACKAGE = 'com.spidersu.worldmaps'
def adb(*args): return subprocess.check_output(ADB + list(args))
assert adb('shell', 'getprop', 'ro.kernel.qemu').strip() == b'1'
def dump():
    time.sleep(.6)
    adb('shell', 'uiautomator', 'dump', '/sdcard/explorer-review.xml')
    return ET.fromstring(adb('exec-out', 'cat', '/sdcard/explorer-review.xml'))
def nodes(name, tree):
    return [n for n in tree.iter('node') if n.get('text') == name or n.get('content-desc') == name]
def tap(name, index=0):
    for _ in range(4):
        choices = nodes(name, dump())
        radios = [n for n in choices if n.get('checkable') == 'true']
        if radios: choices = radios
        if len(choices) > index:
            node = choices[index]
            x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds')))
            adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))
            return
        adb('shell', 'input', 'swipe', '1000', '1900', '1000', '1050', '300')
    raise AssertionError('Missing '+name)
def shot(name): (ROOT / (name+'.png')).write_bytes(adb('exec-out', 'screencap', '-p'))
def profile():
    tap('Profile')
    return dump()
def xp(tree): return next(n.get('text') for n in tree.iter('node') if re.fullmatch(r'\d+ XP', n.get('text','')))
def checked(name):
    choices = [n for n in nodes(name, dump()) if n.get('checkable') == 'true']
    return any(n.get('checked') == 'true' for n in choices)
def restart():
    adb('shell', 'am', 'force-stop', PACKAGE)
    adb('shell', 'am', 'start', '-n', PACKAGE+'/.MainActivity')
    time.sleep(1)
    return profile()

if '--baseline' in sys.argv:
    before = profile()
    STATE.write_text(json.dumps({'xp': xp(before)}))
    shot('android-before')
    print(STATE.read_text())
    sys.exit()

before = json.loads(STATE.read_text())
assert xp(profile()) == before['xp'], 'Upgrade changed XP'
tap('Your explorer')
originals = [n for n in nodes('Original', dump()) if n.get('checkable') == 'true']
assert len(originals) == 2 and all(n.get('checked') == 'true' for n in originals), 'Old profile defaults changed'
try:
    tap('Red')
    tap('Green')
    assert checked('Red') and checked('Green')
    shot('android-editor')
    adb('shell', 'input', 'keyevent', '4')
    assert xp(restart()) == before['xp']
    tap('Your explorer')
    assert checked('Red') and checked('Green'), 'Colours did not survive restart'
    shot('android-restored-choice')
finally:
    tap('Original', 0)
    tap('Original', 1)
    originals = [n for n in nodes('Original', dump()) if n.get('checkable') == 'true']
    assert len(originals) == 2 and all(n.get('checked') == 'true' for n in originals)
    adb('shell', 'input', 'keyevent', '4')
    assert xp(restart()) == before['xp']
    shot('android-profile-preserved')
print({'pass': True, 'xp': before['xp'], 'coloursRestoredToOriginal': True})
