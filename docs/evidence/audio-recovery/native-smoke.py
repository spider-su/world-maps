"""Run on the existing English API 35 emulator after install -r; never clears data."""
import pathlib
import re
import subprocess
import time
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent
ADB = ['adb', '-s', 'emulator-5554']
PACKAGE = 'com.spidersu.worldmaps'

def adb(*args):
    return subprocess.check_output(ADB + list(args))

assert adb('shell', 'getprop', 'ro.kernel.qemu').strip() == b'1'

def dump():
    time.sleep(.8)
    adb('shell', 'uiautomator', 'dump', '/sdcard/audio-review.xml')
    return ET.fromstring(adb('exec-out', 'cat', '/sdcard/audio-review.xml'))

def tap(node):
    x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds')))
    adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))

def tab(name):
    tap(next(n for n in dump().iter('node') if n.get('text') == name and n.get('clickable') == 'false'))

def switch(tree, name):
    return next(n for n in tree.iter('node') if n.get('class') == 'android.widget.Switch' and n.get('content-desc') == name)

def shot(name):
    (ROOT / (name + '.png')).write_bytes(adb('exec-out', 'screencap', '-p'))

def restart():
    adb('shell', 'am', 'force-stop', PACKAGE)
    adb('shell', 'am', 'start', '-n', PACKAGE + '/.MainActivity')
    time.sleep(1.5)
    tab('Settings')

initial = dump()
names = ['Background music', 'Quiz sound effects']
original = {name: switch(initial, name).get('checked') for name in names}
volume = next(n.get('text') for n in initial.iter('node') if n.get('text', '').startswith('Volume:'))
try:
    for name in names:
        tap(switch(dump(), name))
        assert switch(dump(), name).get('checked') != original[name], name + ' did not change'
    restart()
    restored = dump()
    for name in names:
        assert switch(restored, name).get('checked') != original[name], name + ' did not persist'
    assert any(n.get('text') == volume for n in restored.iter('node'))
    shot('android-toggles-restored')
finally:
    for name in names:
        tree = dump()
        if switch(tree, name).get('checked') != original[name]:
            tap(switch(tree, name))
    restart()
    final = dump()
    assert all(switch(final, name).get('checked') == original[name] for name in names)
    shot('android-preferences-restored')

tab('Profile')
profile = dump()
texts = [n.get('text') for n in profile.iter('node')]
assert all(text in texts for text in ['350 XP', '9', '16']), 'Upgrade changed observed profile facts'
shot('android-profile-preserved')
print({'pass': True, 'original': original, 'volume': volume, 'profile': {'xp': 350, 'discoveries': 9, 'correct': 16}})
