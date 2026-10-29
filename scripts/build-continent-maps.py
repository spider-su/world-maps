"""Build four offline packs. Usage: python build-continent-maps.py countries.geojson countries.json flags/4x3
Build-time dependency: shapely==2.0.7. Source revisions/licenses: docs/continent-maps.md.
Europe data/IDs are deliberately left untouched. No downloads at runtime or in this script.
"""
import hashlib
import json
import math
from pathlib import Path
import sys
from shapely.geometry import shape, box, Point
from shapely.ops import transform

root = Path(__file__).resolve().parents[1]
geo, facts_file, flags = map(Path, sys.argv[1:])
features = json.loads(geo.read_text())['features']
rows = {r['cca3']: r for r in json.loads(facts_file.read_text())}
# Explicit learning coverage, including transcontinental countries in both relevant packs.
# Other territories/disputed map units remain non-selectable context.
packs = {
 'asia': ('Asia', (19, -12, 191, 83), 'AFG ARM AZE BHR BGD BTN BRN KHM CHN CYP GEO IND IDN IRN IRQ ISR JPN JOR KAZ KWT KGZ LAO LBN MYS MDV MNG MMR NPL PRK OMN PAK PSE PHL QAT RUS SAU SGP KOR LKA SYR TWN TJK THA TLS TUR TKM ARE UZB VNM YEM'),
 'africa': ('Africa', (-26, -36, 64, 39), 'DZA AGO BEN BWA BFA BDI CPV CMR CAF TCD COM COG COD DJI EGY GNQ ERI SWZ ETH GAB GMB GHA GIN GNB CIV KEN LSO LBR LBY MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE'),
 'south-america': ('South America', (-83, -57, -33, 14), 'ARG BOL BRA CHL COL ECU GUY PRY PER SUR URY VEN'),
 'oceania': ('Oceania', (110, -51, 213, 27), 'AUS FJI KIR MHL FSM NRU NZL PLW PNG WSM SLB TON TUV VUT'),
}
existing = json.loads((root/'src/features/geography/data/country-facts.json').read_text())['countries']
all_facts = {}
result = {}
for key, (title, bounds, members) in packs.items():
    west, south, east, north = bounds
    ref = (north + south)/2
    cos = math.cos(math.radians(ref))
    scale = min(824/((east-west)*cos), 530/(north-south))
    xoff = (864-(east-west)*cos*scale)/2
    yoff = (570-(north-south)*scale)/2
    def lon(x):
        return x+360 if (key == 'oceania' and x < 0) or (key == 'asia' and x < -150) else x
    def project(x, y, z=None):
        return (xoff+(lon(x)-west)*cos*scale, yoff+(north-y)*scale)
    outlines, context, geometries = [], [], {}
    by_id = {}
    for feature in features:
        p = feature['properties']
        country_id = p['ADM0_A3']
        # Natural Earth uses several non-ISO admin codes.
        country_id = {'SAH':'ESH','SDS':'SSD','SOL':'SLB','PSX':'PSE'}.get(country_id, country_id)
        neighbors = {'asia':'FIN NOR UKR BLR ROU BGR GRC EGY ETH SOM PNG AUS', 'africa':'ESP PRT ITA GRC TUR SAU YEM ISR JOR ESH', 'south-america':'PAN CRI TTO FLK GUF', 'oceania':'IDN TLS PHL MYS BRN'}
        if country_id not in members.split() and country_id not in neighbors[key].split(): continue
        geom = transform(project, shape(feature['geometry'])).intersection(box(0,0,864,570)).buffer(0)
        if geom.is_empty: continue
        by_id[country_id] = geom
        simplified = geom.simplify(.35, preserve_topology=True)
        polygons = list(simplified.geoms) if simplified.geom_type == 'MultiPolygon' else [simplified]
        paths = []
        for poly in polygons:
            if poly.geom_type != 'Polygon': continue
            for ring in [poly.exterior, *poly.interiors]:
                pts = [(round(x,1),round(y,1)) for x,y in ring.coords]
                area = abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(pts,pts[1:])))/2
                if area > .01: paths.append('M'+' '.join(f'{x},{y}' for x,y in pts)+'Z')
        if country_id not in members.split() and paths:
            context.append({'id':country_id,'path':''.join(paths)})
        if country_id in members.split(): geometries[country_id] = (geom, ''.join(paths))
    for country_id in members.split():
        row = rows[country_id]
        lat, lng = row['latlng']
        if country_id in geometries:
            geom, path = geometries[country_id]
            # Use an interior anchor so markers and labels stay attached to land.
            anchor = geom.representative_point()
            x,y = anchor.x,anchor.y
            area = geom.area
        else:
            x,y = project(lng,lat)
            geom, path, area = Point(x,y), '', 0
        assert 0 <= x <= 864 and 0 <= y <= 570, (country_id,x,y)
        outlines.append({'id':country_id,'name':row['name']['common'],'latitude':lat,'longitude':lng,'labelX':x,'labelY':y,'area':round(area,1),'path':path})
        geometries[country_id] = geom
        if country_id not in existing:
            capital = ', '.join(row['capital'])
            code = row['cca2'].lower()
            all_facts[country_id] = {'name':{'en':row['name']['common'],'pl':row['translations']['pol']['common'],'ru':row['translations']['rus']['common']},'capital':dict.fromkeys(['en','pl','ru'],capital),'flagCode':code.upper(),'flagSvg':(flags/f'{code}.svg').read_text().strip()}
    distances = {}
    for i,a in enumerate(outlines):
        for b in outlines[i+1:]:
            # Boundary separation in the pack's local equirectangular km plane.
            value = geometries[a['id']].distance(geometries[b['id']])*111.2/scale
            # Tiny/missing islands use source reference points, still in the same plane.
            distances[':'.join(sorted([a['id'],b['id']]))] = round(value,1)
    result[key] = {'title':title,'bounds':bounds,'countries':outlines,'context':context,'distances':distances}
    print(key,len(outlines),len(context),'context outlines')
output = {'sourceSha256':hashlib.sha256(geo.read_bytes()).hexdigest(),'factsSha256':hashlib.sha256(facts_file.read_bytes()).hexdigest(),'packs':result,'facts':all_facts}
(root/'src/features/geography/data/continent-maps.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
