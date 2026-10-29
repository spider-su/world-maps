"""Targeted slider check on world-maps-poc; install -r first, never clear data."""
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
    time.sleep(.5)
    adb('shell', 'uiautomator', 'dump', '/sdcard/volume-review.xml')
    return ET.fromstring(adb('exec-out', 'cat', '/sdcard/volume-review.xml'))

def bounds(node):
    return list(map(int, re.findall(r'\d+', node.get('bounds'))))

def volume(tree):
    text = next(n.get('text') for n in tree.iter('node') if n.get('text', '').startswith('Volume:'))
    return int(re.search(r'\d+', text).group())

def slider(tree):
    return next(n for n in tree.iter('node') if n.get('class') == 'android.widget.SeekBar')

def settings():
    tree = dump()
    node = next(n for n in tree.iter('node') if n.get('text') == 'Settings' and n.get('clickable') == 'false')
    x1, y1, x2, y2 = bounds(node)
    adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))
    return dump()

def shot(name):
    (ROOT / (name+'.png')).write_bytes(adb('exec-out', 'screencap', '-p'))

def restart():
    adb('shell', 'am', 'force-stop', PACKAGE)
    adb('shell', 'am', 'start', '-n', PACKAGE+'/.MainActivity')
    time.sleep(1)
    return settings()

def restore(target):
    tree = dump()
    x1, y1, x2, y2 = bounds(slider(tree))
    low, high = x1, x2
    for _ in range(11):
        current = volume(tree)
        if current == target:
            return
        x = (low+high)//2
        adb('shell', 'input', 'tap', str(x), str((y1+y2)//2))
        tree = dump()
        current = volume(tree)
        if current < target:
            low = x+1
        elif current > target:
            high = x-1
    assert volume(tree) == target, 'Could not restore original volume'

initial = settings()
original = volume(initial)
try:
    x1, y1, x2, y2 = bounds(slider(initial))
    y = (y1+y2)//2
    adb('shell', 'input', 'swipe', str((x1+x2)//2), str(y), str(x2-2), str(y), '650')
    changed = dump()
    assert volume(changed) == 30, 'Drag failed to reach maximum'
    shot('android-slider-30')
    assert volume(restart()) == 30, 'Slider volume did not survive restart'
    shot('android-slider-restart')
finally:
    restore(original)
    assert volume(restart()) == original
    shot('android-slider-restored')
print({'pass': True, 'draggedVolume': 30, 'restoredVolume': original})
