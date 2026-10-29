"""Compact large-text globe/insets; restore every changed emulator setting."""
import pathlib
import re
import subprocess
import time
import xml.etree.ElementTree as ET
ADB=['adb','-s','emulator-5554']
def adb(*args): return subprocess.check_output(ADB+list(args))
assert adb('shell','getprop','ro.kernel.qemu').strip()==b'1'
assert adb('shell','wm','size').strip()==b'Physical size: 1080x2400'
assert adb('shell','settings','get','system','font_scale').strip()==b'1.0'
assert adb('shell','settings','get','secure','navigation_mode').strip()==b'2'
assert b'no' in adb('shell','cmd','uimode','night')
def dump():
    time.sleep(.5)
    adb('shell','uiautomator','dump','/sdcard/globe-layout.xml')
    return ET.fromstring(adb('exec-out','cat','/sdcard/globe-layout.xml'))
def find(name): return next((n for n in dump().iter('node') if n.get('content-desc','').startswith(name) or n.get('text')==name),None)
def tap(name):
    for _ in range(6):
        node=find(name)
        if node is not None:
            x1,y1,x2,y2=map(int,re.findall(r'\d+',node.get('bounds')))
            if x2>x1 and y2>y1:
                adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))
                return
        adb('shell','input','swipe','810','1190','810','520','300')
    raise AssertionError('Missing '+name)
try:
    adb('shell','wm','size','840x1491')
    adb('shell','settings','put','system','font_scale','1.5')
    adb('shell','cmd','uimode','night','yes')
    adb('shell','cmd','overlay','enable-exclusive','--category','com.android.internal.systemui.navbar.threebutton')
    adb('shell','am','force-stop','com.spidersu.worldmaps')
    adb('shell','am','start','-n','com.spidersu.worldmaps/.MainActivity')
    time.sleep(1)
    tap('Explore the globe')
    for name in ['Back to Home','Centre globe on selected region','Rotate globe east']:
        node=find(name)
        assert node is not None,name
        x1,y1,x2,y2=map(int,re.findall(r'\d+',node.get('bounds')))
        assert 0<=x1<x2<=840 and 40<y1<y2<1365,(name,node.get('bounds'))
    tap('Rotate globe east')
    pathlib.Path(__file__).with_name('android-compact-dark-large.png').write_bytes(adb('exec-out','screencap','-p'))
    adb('shell','input','keyevent','4')
finally:
    adb('shell','wm','size','reset')
    adb('shell','settings','put','system','font_scale','1.0')
    adb('shell','cmd','uimode','night','no')
    adb('shell','cmd','overlay','enable-exclusive','--category','com.android.internal.systemui.navbar.gestural')
print('PASS: compact/150%/dark/button navigation; emulator settings restored')
