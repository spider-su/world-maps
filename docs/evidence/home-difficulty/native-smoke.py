"""Focused Home/Maps check; no preference edits or storage resets."""
import pathlib
import re
import subprocess
import time
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent
ADB = ['adb', '-s', 'emulator-5554']
def adb(*args): return subprocess.check_output(ADB + list(args))
assert adb('shell', 'getprop', 'ro.kernel.qemu').strip() == b'1'
def dump():
    time.sleep(.6)
    adb('shell', 'uiautomator', 'dump', '/sdcard/home-review.xml')
    return ET.fromstring(adb('exec-out', 'cat', '/sdcard/home-review.xml'))
def texts(tree): return [n.get('text') for n in tree.iter('node') if n.get('text')]
def tap(name):
    for _ in range(3):
        tree = dump()
        node = next((n for n in tree.iter('node') if n.get('text') == name), None)
        if node is not None:
            x1, y1, x2, y2 = map(int, re.findall(r'\d+', node.get('bounds')))
            adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))
            return
        adb('shell', 'input', 'swipe', '1000', '1900', '1000', '1100', '300')
    raise AssertionError('Missing control: '+name)
def shot(name): (ROOT / (name+'.png')).write_bytes(adb('exec-out', 'screencap', '-p'))

home = dump()
summary = next(t for t in texts(home) if t.startswith('Europe ·'))
assert all(level not in summary for level in ['Easy', 'Normal', 'Difficult'])
shot('android-home')
tap('Customize quiz')
setup = dump()
assert not set(['Difficulty', 'Easy', 'Normal', 'Difficult']).intersection(texts(setup))
shot('android-home-setup')
adb('shell', 'input', 'keyevent', '4')
tap('Maps')
tap('Customize quiz')
map_setup = dump()
assert set(['Difficulty', 'Easy', 'Normal', 'Difficult']).issubset(texts(map_setup))
shot('android-map-setup')
adb('shell', 'input', 'keyevent', '4')
tap('Home')
assert summary in texts(dump())
print({'pass': True, 'homeSummary': summary, 'difficultyAvailableOnlyInMaps': True})
