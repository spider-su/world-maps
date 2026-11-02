"""Capture/selection helper used for this manual, staged smoke run.
Not a complete regression runner. Recreate the named disposable profile before use.
Outputs to artifacts/ by default; never overwrites this dated evidence by default.
"""
import subprocess,time,re,pathlib,xml.etree.ElementTree as E,json,os
ADB=[os.environ.get('ADB','adb'),'-s',os.environ.get('ANDROID_SERIAL','emulator-5554')]
OUT=pathlib.Path(os.environ.get('WORLD_MAPS_EVIDENCE_OUT','artifacts/android-smoke-captures'));OUT.mkdir(parents=True,exist_ok=True);PKG='com.spidersu.worldmaps'
def guard():
 assert adb('shell','getprop','ro.kernel.qemu').strip()==b'1','Emulator only'
 assert adb('shell','am','get-current-user').strip()==b'10','Isolated test user only'
 assert '10:WorldMapsSmokeNov02' in adb('shell','pm','list','users').decode(),'Expected disposable test profile only'
def adb(*args):return subprocess.check_output(ADB+list(args))
def tree():
 time.sleep(.35);adb('shell','uiautomator','dump','/sdcard/world-smoke.xml');return E.fromstring(adb('exec-out','cat','/sdcard/world-smoke.xml'))
def bounds(n):return list(map(int,re.findall(r'\d+',n.get('bounds'))))
def find(label,t=None):
 ns=list((t if t is not None else tree()).iter('node'))
 n=next((n for n in ns if label in [n.get('content-desc'),n.get('resource-id')]),None)
 if n is None:n=next((n for n in ns if n.get('text')==label),None)
 return n if n is not None else next((n for n in ns if n.get('content-desc','').startswith(label)),None)
def labels(t=None):
 for n in (t if t is not None else tree()).iter('node'):
  s=n.get('content-desc') or n.get('text')
  if s: print(s, n.get('bounds'), 'enabled='+n.get('enabled',''))
def tap(label):
 guard()
 for _ in range(5):
  t=tree();n=find(label,t);parents={c:p for p in t.iter('node')for c in p}
  if n is not None:
   if not label.startswith('Map country '):
    while n.get('clickable')!='true' and n in parents:n=parents[n]
   x,y,x2,y2=bounds(n)
   h=int(re.findall(r'\d+x(\d+)',adb('shell','wm','size').decode())[-1])
   density=int(re.findall(r'\d+',adb('shell','wm','density').decode())[-1])/160
   nav=adb('shell','settings','get','secure','navigation_mode').strip()
   bottom=h-round((48 if nav==b'0' else 24)*density)
   if n.get('enabled')!='false' and y>=50 and y2<=bottom and y2-y>=28:
    adb('shell','input','tap',str((x+x2)//2),str((y+y2)//2));return
  scrolls=[n for n in t.iter('node')if n.get('scrollable')=='true']
  if not scrolls:break
  s=max(scrolls,key=lambda n:bounds(n)[3]-bounds(n)[1]);x,y,x2,y2=bounds(s)
  adb('shell','input','swipe',str((x+x2)//2),str(round(y+(y2-y)*.8)),str((x+x2)//2),str(round(y+(y2-y)*.25)),'350')
 raise AssertionError('Missing safely tappable '+label)
def back():
 guard();adb('shell','input','keyevent','4');time.sleep(.3)
def shot(name):
 t=tree();(OUT/(name+'.xml')).write_bytes(E.tostring(t,encoding='utf-8'));(OUT/(name+'.png')).write_bytes(adb('exec-out','screencap','-p'));return t
def launch():
 guard()
 adb('shell','am','force-stop','--user','10',PKG);adb('shell','am','start','--user','10','-n',PKG+'/.MainActivity');time.sleep(1)
def swipeup():
 guard()
 w,h=map(int,re.findall(r'(\d+)x(\d+)',adb('shell','wm','size').decode())[-1]);adb('shell','input','swipe',str(w//2),str(round(h*.75)),str(w//2),str(round(h*.25)),'400')
if __name__=='__main__':
 import sys
 guard()
 if sys.argv[1]=='dump':labels(shot(sys.argv[2]))
 elif sys.argv[1]=='tap':tap(sys.argv[2])
 elif sys.argv[1]=='back':back()
 elif sys.argv[1]=='launch':launch()
