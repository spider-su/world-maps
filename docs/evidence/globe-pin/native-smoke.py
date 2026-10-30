"""Focused Android globe smoke, fresh preview installed with adb install -r.
No country discoveries or answers are written by globe exploration.
"""
import json, math, pathlib, re, subprocess, time, xml.etree.ElementTree as ET
ADB=['adb','-s','emulator-5554'];PACKAGE='com.spidersu.worldmaps'
OUT=pathlib.Path('artifacts/globe-pin-native');OUT.mkdir(exist_ok=True)
EVIDENCE=pathlib.Path('docs/evidence/globe-pin')
def adb(*args):return subprocess.check_output(ADB+list(args))
def tree():
 time.sleep(.4);adb('shell','uiautomator','dump','/sdcard/globe-pin.xml');return ET.fromstring(adb('exec-out','cat','/sdcard/globe-pin.xml'))
def find(label,t=None):
 nodes=list((t if t is not None else tree()).iter('node'))
 return next((n for n in nodes if label in [n.get('text'),n.get('content-desc'),n.get('resource-id')]),None)
def bounds(n):return list(map(int,re.findall(r'\d+',n.get('bounds'))))
def tap(label):
 t=tree();n=find(label,t);assert n is not None,'Missing '+label
 parents={c:p for p in t.iter('node')for c in p}
 while n.get('clickable')!='true' and n in parents:n=parents[n]
 x,y,x2,y2=bounds(n);adb('shell','input','tap',str((x+x2)//2),str((y+y2)//2))
def back():adb('shell','input','keyevent','4');time.sleep(.4)
def capture(name):
 t=tree();(OUT/(name+'.xml')).write_bytes(adb('exec-out','cat','/sdcard/globe-pin.xml'))
 (EVIDENCE/(name+'.png')).write_bytes(adb('exec-out','screencap','-p'));return t
def xp():return next(n.get('text')for n in tree().iter('node')if re.fullmatch(r'\d+ XP',n.get('text','')))
def launch():adb('shell','am','force-stop',PACKAGE);adb('shell','am','start','-n',PACKAGE+'/.MainActivity');time.sleep(1)
def select(longitude,latitude):
 t=tree();n=find('globe-surface',t);assert n is not None,'Missing globe'
 x,y,x2,y2=bounds(n);dl=math.radians(longitude-20);lat=math.radians(latitude);centre=math.radians(48)
 gx=100+92*math.cos(lat)*math.sin(dl);gy=100-92*(math.cos(centre)*math.sin(lat)-math.sin(centre)*math.cos(lat)*math.cos(dl))
 adb('shell','input','tap',str(round(x+(x2-x)*gx/200)),str(round(y+(y2-y)*gy/200)))
assert adb('shell','getprop','ro.kernel.qemu').strip()==b'1'
launch();tap('Profile');before=xp();tap('Home')
# Card is below the mode tiles; scroll Home if needed.
for _ in range(3):
 t=tree();n=find('Explore the globe',t)
 if n is not None and bounds(n)[3]<2180:break
 adb('shell','input','swipe','800','1900','800','800','400')
tap('Explore the globe');select(13.4,52.5);t=capture('android-country');assert find('Germany',t) is not None and find('Hide photos',t) is not None
back();capture('android-pin');n=find('globe-surface');x,y,x2,y2=bounds(n);cx=(x+x2)//2;cy=(y+y2)//2
adb('shell','input','swipe',str(cx),str(cy),str(cx+140),str(cy+30),'500');assert find('Close') is None,'Drag opened popup'
tap('Centre globe on selected region');select(-30,0);t=capture('android-ocean');assert find('Ocean or area outside the country collection',t) is not None
back();tap('Explore centre of globe');assert find('Hide photos') is not None;back();back();tap('Profile');after=xp();assert before==after,(before,after);tap('Home');launch()
(OUT/'result.json').write_text(json.dumps({'xpBefore':before,'xpAfter':after,'country':'Germany','countryDetails':True,'expandedPhotos':True,'dragGuard':True,'ocean':True,'centreControl':True,'relaunch':True},indent=2)+'\n')
print('PASS',before,after,flush=True)
