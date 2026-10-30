"""Run on emulator-5554 after installing the fresh source-matched APK with -r.
No answers, discoveries or cosmetic changes are submitted; settings restore in finally.
"""
import hashlib,io,json,pathlib,re,subprocess,sys,time,xml.etree.ElementTree as ET
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent
ART=pathlib.Path('artifacts/map-framing-native');ART.mkdir(exist_ok=True)
ADB=['adb','-s','emulator-5554'];PACKAGE='com.spidersu.worldmaps';CACHE=None
def adb(*args):return subprocess.check_output(ADB+list(args))
def dump(name=None):
 global CACHE
 time.sleep(.4);adb('shell','uiautomator','dump','/sdcard/map-framing.xml');raw=adb('exec-out','cat','/sdcard/map-framing.xml')
 if name:(ART/(name+'.xml')).write_bytes(raw);(ROOT/(name+'.png')).write_bytes(adb('exec-out','screencap','-p'))
 CACHE=ET.fromstring(raw);return CACHE
def node(label,tree=None):
 ns=list((tree if tree is not None else CACHE if CACHE is not None else dump()).iter('node'))
 exact=next((n for n in ns if n.get('text')==label or n.get('content-desc')==label),None)
 return exact if exact is not None else next((n for n in ns if n.get('content-desc','').startswith(label)),None)
def tap(label):
 global CACHE
 for _ in range(4):
  tree=CACHE if CACHE is not None else dump()
  assert any(n.get('package')==PACKAGE for n in tree.iter('node')),'App is not foreground: '+label
  parents={child:parent for parent in tree.iter('node')for child in parent}
  n=node(label,tree)
  if n is not None:
   while n.get('clickable')!='true' and n in parents:n=parents[n]
   x,y,x2,y2=map(int,re.findall(r'\d+',n.get('bounds')))
   size=re.findall(r'(\d+)x(\d+)',adb('shell','wm','size').decode())[-1];w,h=map(int,size)
   density=int(re.findall(r'\d+',adb('shell','wm','density').decode())[-1])/160
   bottom=h-int((48 if adb('shell','settings','get','secure','navigation_mode').strip()==b'0'else 24)*density)
   safe=n.get('clickable')=='true' and y>=64 and y2<=bottom and y2-y>=96
   ancestor=n
   while ancestor in parents:
    ancestor=parents[ancestor]
    if ancestor.get('scrollable')=='true':
     ax,ay,ax2,ay2=map(int,re.findall(r'\d+',ancestor.get('bounds')));safe=safe and y>=ay and y2<=ay2
   if safe:
    adb('shell','input','tap',str((x+x2)//2),str((y+y2)//2));CACHE=None;return
  scrolls=[n for n in tree.iter('node')if n.get('scrollable')=='true']
  assert scrolls,'No scrollable surface for '+label
  scroll=max(scrolls,key=lambda n:int(re.findall(r'\d+',n.get('bounds'))[3])-int(re.findall(r'\d+',n.get('bounds'))[1]))
  x,y,x2,y2=map(int,re.findall(r'\d+',scroll.get('bounds')));sx=(x+x2)//2
  adb('shell','input','swipe',str(sx),str(int(y+(y2-y)*.8)),str(sx),str(int(y+(y2-y)*.25)),'400');CACHE=None
 raise AssertionError('Missing safely tappable '+label)
def back():
 global CACHE
 adb('shell','input','keyevent','4');time.sleep(.3);CACHE=None
def launch():
 global CACHE
 adb('shell','am','force-stop',PACKAGE);adb('shell','am','start','-n',PACKAGE+'/.MainActivity');time.sleep(1);CACHE=None
def pixels(box):
 image=Image.open(io.BytesIO(adb('exec-out','screencap','-p')))
 return hashlib.sha256(image.crop(box).tobytes()).hexdigest()
def xp():return next(n.get('text')for n in dump().iter('node')if re.fullmatch(r'\d+ XP',n.get('text','')))
def home():
 for _ in range(4):
  if node('Maps: ')is not None:return
  if node('Home')is not None:tap('Home');return
  back()
def choose_map(name):home();tap('Maps: ');tap(name)
assert adb('shell','getprop','ro.kernel.qemu').strip()==b'1'
launch();tap('Profile');before=xp();baseline=pathlib.Path('artifacts/map-framing-before/state.json')
if baseline.exists():assert before==json.loads(baseline.read_text())['xp']
tap('Home');original=node('Maps: ').get('content-desc').split(': ',1)[1]
font=adb('shell','settings','get','system','font_scale').decode().strip()
night=adb('shell','cmd','uimode','night').decode().strip().split(': ')[-1]
nav=adb('shell','settings','get','secure','navigation_mode').strip()
results=[]
try:
 for name,regions in [('Europe',['North Atlantic']),('Asia',['Gulf states','Southeast islands']),('Africa',['Indian Ocean']),('North America',['Caribbean']),('South America',[]),('Oceania',['Micronesia','South Pacific'])][int(sys.argv[1]) if len(sys.argv)>1 else 0:]:
  choose_map(name);tap('Learn.');dump(name.lower().replace(' ','-')+'-learn')
  for region in regions:
   tap('Expand regional map: '+region);tree=dump(name.lower().replace(' ','-')+'-'+region.lower().replace(' ','-'))
   assert node('Close',tree)is not None,'Missing sticky close'
   box=None
   if region=='Caribbean':
    detail=next(n for n in tree.iter('node')if n.get('resource-id')=='region-detail-caribbean');box=tuple(map(int,re.findall(r'\d+',detail.get('bounds'))));before_zoom=pixels(box)
   tap('Zoom in: '+region)
   if region=='Caribbean':tap('Zoom in: '+region) # 1.7x still fits the region width; 2.89x allows horizontal pan.
   dump(name.lower().replace(' ','-')+'-'+region.lower().replace(' ','-')+'-zoom')
   if box:
    zoom_pixels=pixels(box);assert zoom_pixels!=before_zoom,'Regional zoom did not change geography'
    x,y,x2,y2=box;adb('shell','input','swipe',str((x+x2)//2),str((y+y2)//2),str((x+x2)//2-120),str((y+y2)//2),'500');CACHE=None;dump('caribbean-drag');assert pixels(box)!=zoom_pixels,'Regional drag did not pan geography'
   tap('Show whole map: '+region);back()
  tap('Zoom in');tap('Show whole map');assert node('Main view')is not None;tap('Main view');back()
  tap('Find It.');dump(name.lower().replace(' ','-')+'-find');back();results.append(name);print(name,'PASS',flush=True)
 choose_map('North America');tap('Name It.');tap('Expand regional map: Caribbean');tree=dump('caribbean-name-it')
 choices=[n for n in tree.iter('node')if n.get('content-desc','').startswith('Small country marker')]
 assert not choices,'Name It inset showed answer controls'
 back();back();tap('Hot & Cold.');tap('Expand regional map: Caribbean');dump('caribbean-hot-cold');back();back()
 # Dragging the main map must not record a discovery at release.
 tap('Learn.');adb('shell','input','swipe','470','850','650','960','500');dump('north-america-pan');back()
 tap('Maps');dump('maps-preview');tap('Home')
 adb('shell','wm','size','840x1491');adb('shell','settings','put','system','font_scale','1.5');adb('shell','cmd','uimode','night','yes');adb('shell','cmd','overlay','enable','--user','0','com.android.internal.systemui.navbar.threebutton');time.sleep(1);assert adb('shell','settings','get','secure','navigation_mode').strip()==b'0';launch()
 for name in ['North America','Oceania']:
  choose_map(name);tap('Learn.');dump(name.lower().replace(' ','-')+'-small-dark-large')
  region='Caribbean' if name=='North America'else'Micronesia';tap('Expand regional map: '+region);dump(name.lower().replace(' ','-')+'-small-sheet')
  adb('shell','input','swipe','650','1250','650','700','500');dump(name.lower().replace(' ','-')+'-small-choices');back();back()
finally:
 adb('shell','wm','size','reset');adb('shell','settings','put','system','font_scale',font);adb('shell','cmd','uimode','night',night)
 adb('shell','cmd','overlay','enable','--user','0','com.android.internal.systemui.navbar.'+('threebutton'if nav==b'0'else'gestural'))
 launch();choose_map(original)
tap('Profile');after=xp();assert before==after,(before,after);dump('progress-preserved');tap('Home');launch();assert node('Maps: '+original)is not None
(ROOT/'native-result.json').write_text(json.dumps({'maps':results,'xpBefore':before,'xpAfter':after,'originalMapRestored':original,'displayRestored':True,'firstMapIndex':int(sys.argv[1]) if len(sys.argv)>1 else 0},indent=2)+'\n')
print('PASS; preserved',before,after,original,flush=True)
