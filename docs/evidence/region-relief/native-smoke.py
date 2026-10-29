"""Map preview smoke on the existing emulator; no storage clearing or quiz answers."""
import json
import pathlib
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
ROOT = pathlib.Path(__file__).resolve().parent
STATE = pathlib.Path('artifacts/region-relief-native-state.json')
ADB = ['adb', '-s', 'emulator-5554']
PACKAGE = 'com.spidersu.worldmaps'
def adb(*args): return subprocess.check_output(ADB+list(args))
assert adb('shell','getprop','ro.kernel.qemu').strip() == b'1'
def dump():
    time.sleep(.5)
    adb('shell','uiautomator','dump','/sdcard/region-review.xml')
    return ET.fromstring(adb('exec-out','cat','/sdcard/region-review.xml'))
def find(name, prefix=False):
    for n in dump().iter('node'):
        if any((v.startswith(name) if prefix else v == name) for v in [n.get('text',''),n.get('content-desc','')]):
            return n
    raise AssertionError('Missing '+name)
def tap(name, prefix=False):
    n=find(name,prefix)
    x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds')))
    adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))
def shot(name):
    time.sleep(.6)
    (ROOT/(name+'.png')).write_bytes(adb('exec-out','screencap','-p'))
def xp():
    return next(n.get('text') for n in dump().iter('node') if re.fullmatch(r'\d+ XP',n.get('text','')))
def selected():
    return next(n.get('content-desc').split(': ',1)[1] for n in dump().iter('node') if n.get('content-desc','').startswith('Maps: '))
def select(name):
    tap('Maps: ',True)
    # Native button name combines country count; choose prefix, avoiding map summary.
    tap(name+',',True)
    time.sleep(.5)

if '--baseline' in sys.argv:
    tap('Profile')
    before=xp()
    tap('Maps')
    STATE.write_text(json.dumps({'xp':before,'map':selected()}))
    print(STATE.read_text())
    sys.exit()

before=json.loads(STATE.read_text())
tap('Maps')
try:
    for name in ['Europe','Asia','Africa','North America','South America','Oceania']:
        select(name)
        assert selected() == name
        shot('android-'+name.lower().replace(' ','-'))
    select('Europe')
    assert b'no' in adb('shell','cmd','uimode','night')
    assert adb('shell','settings','get','secure','navigation_mode').strip() == b'2'
    try:
        adb('shell','cmd','uimode','night','yes')
        adb('shell','cmd','overlay','enable-exclusive','--category','com.android.internal.systemui.navbar.threebutton')
        shot('android-europe-dark-buttons')
    finally:
        adb('shell','cmd','uimode','night','no')
        adb('shell','cmd','overlay','enable-exclusive','--category','com.android.internal.systemui.navbar.gestural')
    tap('Explore this map')
    shot('android-europe-learn')
    adb('shell','input','keyevent','4')
    tap('Name It.',True)
    shot('android-europe-quiz')
    adb('shell','input','keyevent','4')
    tap('Maps')
finally:
    select(before['map'])
tap('Profile')
assert xp() == before['xp'], 'Preview navigation changed XP'
print({'pass':True,'xp':before['xp'],'selectedMapRestored':before['map']})
