"""Run --baseline before install -r, then run on the fresh emulator APK."""
import hashlib
import io
import json
import pathlib
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent
STATE = pathlib.Path('artifacts/globe-native-state.json')
ADB = ['adb', '-s', 'emulator-5554']
PACKAGE = 'com.spidersu.worldmaps'
def adb(*args): return subprocess.check_output(ADB+list(args))
assert adb('shell','getprop','ro.kernel.qemu').strip() == b'1'
def dump():
    time.sleep(.5)
    adb('shell','uiautomator','dump','/sdcard/globe-review.xml')
    return ET.fromstring(adb('exec-out','cat','/sdcard/globe-review.xml'))
def bounds(node): return tuple(map(int,re.findall(r'\d+',node.get('bounds'))))
def find(name, tree=None):
    return next((n for n in (tree if tree is not None else dump()).iter('node') if n.get('text') == name or n.get('content-desc','').startswith(name)),None)
def tap(name):
    for _ in range(4):
        n=find(name)
        if n is not None:
            x1,y1,x2,y2=bounds(n)
            if y1 >= 120 and y2 <= 2337:
                adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))
                return
        adb('shell','input','swipe','1000','1900','1000','1100','300')
    raise AssertionError('Missing '+name)
def shot(name):
    time.sleep(.3)
    raw=adb('exec-out','screencap','-p')
    (ROOT/(name+'.png')).write_bytes(raw)
    return raw
def pixel_hash(box):
    # Analysis only: compare the globe pixels, excluding the clock/header.
    image=Image.open(io.BytesIO(adb('exec-out','screencap','-p')))
    return hashlib.sha256(image.crop(box).tobytes()).hexdigest()
def xp(): return next(n.get('text') for n in dump().iter('node') if re.fullmatch(r'\d+ XP',n.get('text','')))

if '--baseline' in sys.argv:
    tap('Profile')
    original=xp()
    tap('Home')
    STATE.write_text(json.dumps({'xp':original}))
    print(STATE.read_text())
    sys.exit()

before=json.loads(STATE.read_text())
tap('Explore the globe')
tree=dump()
globe=find('Interactive globe',tree)
assert globe is not None
box=bounds(globe)
assert find('Home',tree) is None, 'Tabs still visible in full-screen globe'
shot('android-globe')
initial=pixel_hash(box)
x1,y1,x2,y2=box
adb('shell','input','swipe',str((x1+x2)//2),str((y1+y2)//2),str(x2-20),str((y1+y2)//2+60),'700')
time.sleep(.5)
assert pixel_hash(box) != initial, 'Native drag did not rotate the globe'
shot('android-drag')
tap('Centre globe on selected region')
time.sleep(.5)
assert pixel_hash(box) == initial, 'Centre did not restore original orientation'
tap('Rotate globe east')
time.sleep(.5)
assert pixel_hash(box) != initial, 'Direction button did not rotate'
tap('Centre globe on selected region')
adb('shell','input','keyevent','4')
tap('Profile')
assert xp() == before['xp']
tap('Home')
tap('Explore the globe')
assert pixel_hash(bounds(find('Interactive globe'))) == initial
adb('shell','am','force-stop',PACKAGE)
adb('shell','am','start','-n',PACKAGE+'/.MainActivity')
time.sleep(1)
tap('Explore the globe')
assert pixel_hash(bounds(find('Interactive globe'))) == initial
shot('android-relaunch')
tap('Back to Home')
assert find('Home') is not None
print({'pass':True,'xp':before['xp'],'dragAndReset':True,'buttonsAndBack':True,'relaunch':True})
