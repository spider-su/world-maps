"""Focused smoke in disposable Android user 10, never the user's app data.
Install the current APK with -r first. Script never signs in or accepts a real invite.
"""
import pathlib,re,subprocess,time,xml.etree.ElementTree as E
ADB=['adb','-s','emulator-5554'];OUT=pathlib.Path('docs/evidence/profile-sharing');PACKAGE='com.spidersu.worldmaps'
def adb(*args):return subprocess.check_output(ADB+list(args))
def tree():
 time.sleep(.4);adb('shell','uiautomator','dump','/sdcard/profile-sharing.xml');return E.fromstring(adb('exec-out','cat','/sdcard/profile-sharing.xml'))
def find(label,t=None):
 nodes=list((t if t is not None else tree()).iter('node'))
 result=next((n for n in nodes if label in [n.get('content-desc'),n.get('resource-id')]),None)
 return result if result is not None else next((n for n in nodes if n.get('text')==label),None)
def bounds(n):return list(map(int,re.findall(r'\d+',n.get('bounds'))))
def tap(label):
 for _ in range(5):
  t=tree();n=find(label,t);parents={c:p for p in t.iter('node')for c in p}
  if n is not None:
   while n.get('clickable')!='true' and n in parents:n=parents[n]
   x,y,x2,y2=bounds(n)
   if y2-y>=32 and y>50 and y2<2290:adb('shell','input','tap',str((x+x2)//2),str((y+y2)//2));return
  scrolls=[n for n in t.iter('node')if n.get('scrollable')=='true'];assert scrolls,'No scroll surface for '+label
  x,y,x2,y2=bounds(max(scrolls,key=lambda n:bounds(n)[3]-bounds(n)[1]));adb('shell','input','swipe',str((x+x2)//2),str(round(y+(y2-y)*.8)),str((x+x2)//2),str(round(y+(y2-y)*.25)),'400')
 raise AssertionError('Missing '+label)
def shot(name):
 t=tree();(OUT/(name+'.png')).write_bytes(adb('exec-out','screencap','-p'));return t
def back():adb('shell','input','keyevent','4');time.sleep(.3)
assert adb('shell','getprop','ro.kernel.qemu').strip()==b'1'
assert adb('shell','am','get-current-user').strip()==b'10','Run only in isolated test user'
url='worldmaps://friend?invite='+'a'*48
adb('shell','am','force-stop','--user','10',PACKAGE);adb('shell','am','start','--user','10','-a','android.intent.action.VIEW','-d',url,PACKAGE);time.sleep(1)
t=shot('android-cold-invitation');assert find('Friend invitation',t) is not None
n=find('Add friend',t);assert n is not None and n.get('enabled')=='false','Invitation accepted without sign-in'
tap('Share World Maps');t=shot('android-share-app');assert any('https://world-map-1.web.app' in n.get('text','')for n in t.iter('node')),'Share payload missing URL';back()
tap('Nickname');adb('shell','input','text','QRTester');back();tap('Share my progress with friends');time.sleep(1);tap('Scan QR code');tap('Allow camera')
t=tree();permission=find('com.android.permissioncontroller:id/permission_allow_foreground_only_button',t)
if permission is not None:
 x,y,x2,y2=bounds(permission);adb('shell','input','tap',str((x+x2)//2),str((y+y2)//2))
time.sleep(2);t=shot('android-camera');assert find('Point your camera at a World Maps QR code.',t) is not None
back();adb('shell','am','start','--user','10','-a','android.intent.action.VIEW','-d',url,PACKAGE);t=shot('android-warm-invitation');assert find('Friend invitation',t) is not None
print('PASS cold/warm custom link, explicit approval, share URL, camera permission/preview; real optical scan and live friendship acceptance SKIP',flush=True)
