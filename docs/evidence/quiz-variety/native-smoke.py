"""Run on API 35 emulator-5554 after installing the matching fresh APK with -r.
No answers/cosmetic edits submitted. Map preference restored in finally.
"""
import json,pathlib,re,subprocess,time,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parent
ADB=['adb','-s','emulator-5554']
def adb(*args):return subprocess.check_output(ADB+list(args))
def dump(name=None):
 time.sleep(.5);adb('shell','uiautomator','dump','/sdcard/quiz-variety.xml');raw=adb('exec-out','cat','/sdcard/quiz-variety.xml')
 if name:(ROOT/(name+'.xml')).write_bytes(raw);(ROOT/(name+'.png')).write_bytes(adb('exec-out','screencap','-p'))
 return ET.fromstring(raw)
def tap(label):
 tree=dump();nodes=[n for n in tree.iter('node') if n.get('text')==label or n.get('content-desc')==label] or [n for n in tree.iter('node') if n.get('content-desc','').startswith(label)]
 assert nodes,'Missing '+label
 x,y,x2,y2=map(int,re.findall(r'\d+',nodes[0].get('bounds')));adb('shell','input','tap',str((x+x2)//2),str((y+y2)//2))
def back():adb('shell','input','keyevent','4');time.sleep(.3)
def xp():return next(n.get('text') for n in dump().iter('node') if re.fullmatch(r'\d+ XP',n.get('text','')))
assert adb('shell','getprop','ro.kernel.qemu').strip()==b'1'
adb('shell','am','start','-n','com.spidersu.worldmaps/.MainActivity');time.sleep(1)
tap('Profile');before=xp();tap('Home')
original=next(n.get('content-desc').split(': ',1)[1] for n in dump().iter('node') if n.get('content-desc','').startswith('Maps: '))
try:
 tap('Maps: ');tap('North America');tap('Settings');tap('Quiz setup');tree=dump('android-pool')
 assert any(n.get('text','').startswith('16/23') for n in tree.iter('node')),'Normal pool not expanded'
 back();tap('Home');tap('Name It.');dump('android-name-it');back();tap('Find It.');tap('Play options');tree=dump('android-options')
 assert any('Normal · 16/23 countries' in n.get('text','') for n in tree.iter('node')),'Stale game pool description'
 back();back();adb('shell','am','force-stop','com.spidersu.worldmaps');adb('shell','am','start','-n','com.spidersu.worldmaps/.MainActivity');time.sleep(1)
 assert any(n.get('content-desc')=='Maps: North America' for n in dump().iter('node')),'Map did not restore'
 tap('Profile');after=xp();assert before==after,(before,after);dump('android-progress-preserved');tap('Home')
finally:
 # Activity restarts on Home. Return from any remaining modal/game first if needed.
 if any(n.get('content-desc')=='Maps: North America' for n in dump().iter('node')):tap('Maps: ');tap(original)
(ROOT/'native-result.json').write_text(json.dumps({'xpBefore':before,'xpAfter':after,'originalMapRestored':original},indent=2)+'\n')
print('PASS',before,after,'restored',original)
