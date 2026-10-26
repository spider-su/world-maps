"""Refresh country article links and up to three freely licensed landscape photos.
Usage: python3 scripts/build-wikipedia-gallery.py /tmp/world-maps-wiki-cache
Only metadata is downloaded; images remain optional online enhancements.
MediaWiki Imageinfo API: https://www.mediawiki.org/wiki/API:Imageinfo
"""
import concurrent.futures
import hashlib
import html
import json
from pathlib import Path
import re
import sys
import time
import threading
import urllib.parse
import urllib.request

root = Path(__file__).resolve().parents[1]
cache = Path(sys.argv[1]); cache.mkdir(parents=True, exist_ok=True)
base = root/'src/features/geography/data'
facts = {**json.loads((base/'continent-maps.json').read_text())['facts'], **json.loads((base/'country-facts.json').read_text())['countries']}
overrides = {'GEO':'Georgia (country)', 'COG':'Republic of the Congo', 'COD':'Democratic Republic of the Congo', 'PSE':'State of Palestine', 'FSM':'Federated States of Micronesia'}

_rate_lock = threading.Lock()
_last_request = 0.0
def query(params):
    global _last_request
    params = {'action':'query','format':'json','formatversion':2,'redirects':1, **params}
    url = 'https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode(params)
    dest = cache/(hashlib.sha256(url.encode()).hexdigest()+'.json')
    if dest.exists(): return json.loads(dest.read_text())
    for attempt in range(3):
        try:
            with _rate_lock:
                time.sleep(max(0, 1.1-(time.monotonic()-_last_request)))
                _last_request = time.monotonic()
            req = urllib.request.Request(url, headers={'User-Agent':'WorldMaps/0.1 (https://github.com/spider-su/world-maps; educational photo metadata)'})
            with urllib.request.urlopen(req, timeout=20) as response: data = json.load(response)
            if 'error' in data: raise ValueError(str(data['error']))
            dest.write_text(json.dumps(data,ensure_ascii=False)); return data
        except Exception:
            if attempt == 2: raise
            time.sleep(10*(attempt+1))

def text(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', value or ''))).strip()

def allowed(url, hosts):
    parsed = urllib.parse.urlsplit(url)
    return parsed.scheme == 'https' and parsed.hostname in hosts

def photo(page):
    info = page.get('imageinfo',[{}])[0]
    meta = info.get('extmetadata',{})
    if not isinstance(meta, dict): return None
    get = lambda key: text(meta.get(key,{}).get('value',''))
    url, source = info.get('thumburl',''), info.get('descriptionurl','')
    license_url, license_name, creator = get('LicenseUrl'),get('LicenseShortName'),get('Artist')
    if license_url.startswith('//'): license_url='https:'+license_url
    is_cc = bool(re.match(r'https://creativecommons\.org/(?:licenses/by(?:-sa)?/[\w.-]+/?|publicdomain/(?:zero|mark)/1\.0/?)$',license_url))
    is_pd = license_name == 'Public domain' and get('Copyrighted') == 'False'
    if not (is_cc or is_pd) or get('Restrictions') or not creator: return None
    if not allowed(url, {'upload.wikimedia.org','thumb.wikimedia.org'}): return None
    if not allowed(source, {'commons.wikimedia.org'}): return None
    return {'url':url,'source':source,'credit':creator,'license':license_name,'licenseUrl':license_url if is_cc else '', 'caption':text(page['title'].removeprefix('File:').rsplit('.',1)[0].replace('_',' '))}

# Exclude symbols, maps, charts and typical portraits/military/history illustrations.
exclude = re.compile(r'flag|coat.of.arms|logo|map\b|population.pyramid|bevölkerungspyramide|painting|engraving|lithograph|canvas|forces|landing|expedition|(?:18\d\d|19[0-4]\d)|population|electricity|generation|energy|economy|sankey|troops|revolt|protest|riot|coup|obama|trump|conference|summit|meeting|bolkiah|\bsby\b|orthographic|location|signature|passport|chart|graph|diagram|battle|tank\b|soldier|military|army|president|prime.minister|war\b|massacre|execution|victim|dead\b|corpse|casualt|weapon|fighter|\bf-\d|decrease|increase|portrait|election|gdp|svg|\b7tp\b',re.I)
landmark = re.compile(r'\b(?:panorama|panoramio|building|tower|ch[aâ]teau|university|plaza|puente|viñedos|aconcagua|perito.moreno|casa.rosada|asado|mount|pyramids?|lago|colosseum|parthenon|acropolis|sagrada|wawel|taj.mahal|angkor|machu.picchu|petra|église|església|iglesia|chiesa|kirche|catedral|castillo|castello|skyline|landscape|castle|palace|temple|mountain|beach|lake|forest|cathedral|mosque|city|old.town|harbour|harbor|coast|waterfall|valley|park\b|monument|island|atoll|reef|village|town|church|bridge|street|\bbay\b|desert|river|museum|market|rainforest|garden|cuisine|dish|food)\b',re.I)

def build(item):
    country_id, country = item
    title = overrides.get(country_id,country['name']['en'])
    article = 'https://en.wikipedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'))
    result = query({'titles':title,'generator':'images','gimlimit':500,'prop':'imageinfo','iiprop':'mime|size'})
    candidates=[]
    for p in result.get('query',{}).get('pages',[]):
        info=p.get('imageinfo',[{}])[0]
        w,h=info.get('width',0),info.get('height',0)
        if info.get('mime') not in ['image/jpeg','image/png'] or w<600 or h<300 or not 1.15 <= w/max(h,1) <= 2.5 or exclude.search(p['title']) or not landmark.search(p['title']): continue
        score = 5*bool(landmark.search(p['title'])) + 2*(country['capital']['en'].lower() in p['title'].lower())
        candidates.append((score,p['title']))
    candidates.sort(key=lambda c:(-c[0],c[1]))
    photos=[]
    # Metadata is expensive: request only six shortlisted photos, then at most six more.
    for offset in [0,6]:
        titles=[t for _,t in candidates[offset:offset+6]]
        if not titles: break
        metadata=query({'titles':'|'.join(titles),'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':640,'iiextmetadatafilter':'Artist|LicenseShortName|LicenseUrl|Copyrighted|Restrictions'})
        by_title={p['title']:p for p in metadata.get('query',{}).get('pages',[])}
        for t in titles:
            p=photo(by_title.get(t,{})) if t in by_title else None
            if p: photos.append(p)
            if len(photos)==3: break
        if len(photos)==3: break
    print(country_id,len(photos),[p['caption'] for p in photos],flush=True)
    return country_id,{'article':article,'photos':photos}

with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
    countries=dict(pool.map(build, sorted(facts.items())))
(base/'wikipedia-gallery.json').write_text(json.dumps({'source':'English Wikipedia article images; Wikimedia Commons Imageinfo metadata','retrieved':'2026-10-27','countries':countries},ensure_ascii=False,indent=2)+'\n')
print('Gallery coverage:',sum(bool(c['photos']) for c in countries.values()),'/',len(countries))
