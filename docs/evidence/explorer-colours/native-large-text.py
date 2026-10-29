"""Inspect the editor in dark/large-text/button navigation; restore system settings."""
import pathlib
import re
import subprocess
import time
import xml.etree.ElementTree as ET
ADB = ['adb', '-s', 'emulator-5554']
def adb(*args): return subprocess.check_output(ADB + list(args))
assert adb('shell', 'getprop', 'ro.kernel.qemu').strip() == b'1'
assert adb('shell', 'settings', 'get', 'system', 'font_scale').strip() == b'1.0'
assert adb('shell', 'settings', 'get', 'secure', 'navigation_mode').strip() == b'2'
assert b'no' in adb('shell', 'cmd', 'uimode', 'night')
def dump():
    adb('shell', 'uiautomator', 'dump', '/sdcard/explorer-large.xml')
    return ET.fromstring(adb('exec-out', 'cat', '/sdcard/explorer-large.xml'))
try:
    adb('shell', 'settings', 'put', 'system', 'font_scale', '1.5')
    adb('shell', 'cmd', 'uimode', 'night', 'yes')
    adb('shell', 'cmd', 'overlay', 'enable-exclusive', '--category', 'com.android.internal.systemui.navbar.threebutton')
    time.sleep(1.5)
    # Changing font_scale recreates the activity; open Profile/editor afterwards.
    for name in ['Profile', 'Your explorer']:
        tree = dump()
        node = next(n for n in tree.iter('node') if n.get('content-desc') == name or n.get('text') == name)
        x1,y1,x2,y2 = map(int,re.findall(r'\d+',node.get('bounds')))
        adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))
        time.sleep(.6)
    for _ in range(3):
        tree = dump()
        green = next((n for n in tree.iter('node') if n.get('content-desc') == 'Green' and n.get('checkable') == 'true'), None)
        if green is not None: break
        adb('shell', 'input', 'swipe', '1000', '1800', '1000', '1100', '300')
    assert green is not None, 'Eye controls unreachable with large text'
    pathlib.Path(__file__).with_name('android-dark-large.png').write_bytes(adb('exec-out', 'screencap', '-p'))
    adb('shell', 'input', 'keyevent', '4')
finally:
    adb('shell', 'settings', 'put', 'system', 'font_scale', '1.0')
    adb('shell', 'cmd', 'uimode', 'night', 'no')
    adb('shell', 'cmd', 'overlay', 'enable-exclusive', '--category', 'com.android.internal.systemui.navbar.gestural')
print('PASS: eye controls reachable; system settings restored')
