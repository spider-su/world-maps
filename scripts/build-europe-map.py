"""Build offline SVG paths from Natural Earth 1:50m countries (no dependencies).
Usage: python3 scripts/build-europe-map.py /path/to/ne_50m_admin_0_countries.geojson
Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson
Natural Earth is public domain. Uses its default de facto boundaries.
"""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
features = json.loads(SOURCE.read_text())['features']
# Preserve existing gameplay IDs and names; markers are kept separately.
metadata = json.loads((ROOT / 'src/features/geography/data/europe-locations.json').read_text())

def project(p):
    return [(p[0] + 26) * 12, (72 - p[1]) * 15]

def clip(points):
    for axis, limit, sign in [(0, 0, 1), (0, 864, -1), (1, 0, 1), (1, 570, -1)]:
        output = []
        for a, b in zip(points[-1:] + points[:-1], points):
            inside_a = (a[axis] - limit) * sign >= 0
            inside_b = (b[axis] - limit) * sign >= 0
            if inside_a != inside_b:
                t = (limit - a[axis]) / (b[axis] - a[axis])
                output.append([a[i] + t * (b[i] - a[i]) for i in range(2)])
            if inside_b:
                output.append(b)
        points = output
    return points

def simplify(points, tolerance=0.35):
    if len(points) <= 2:
        return points
    a, b = points[0], points[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    def distance(p):
        t = max(0, min(1, ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
        return ((p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2)**0.5
    index = max(range(1, len(points)-1), key=lambda i: distance(points[i]))
    if distance(points[index]) <= tolerance:
        return [a, b]
    return simplify(points[:index+1], tolerance)[:-1] + simplify(points[index:], tolerance)

shapes, context = [], []
context_ids = {'DZA','MAR','TUN','LBY','EGY','SYR','IRQ','IRN','GEO','ARM','AZE','KAZ','FRO','IMN','JEY','GGY','CYN','ALD'}
for feature in features:
    p, geometry = feature['properties'], feature['geometry']
    country_id = p['ADM0_A3']
    if country_id not in metadata and country_id not in context_ids:
        continue
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    rings = []
    area = 0
    for polygon in polygons:
        for ring in polygon:
            points = clip([project(point) for point in ring])
            if len(points) < 4:
                continue
            area += abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(points, points[1:]+points[:1])))/2
            points = simplify(points)
            if len(points) < 4:
                continue
            rings.append('M'+' '.join(f'{x:.1f},{y:.1f}' for x,y in points)+'Z')
    if not rings:
        continue
    item = {'id':country_id, 'path':''.join(rings)}
    if country_id in metadata:
        item.update(metadata[country_id])
        item['area'] = round(area, 1)
        item['labelX'],item['labelY'] = project([item['longitude'],item['latitude']])
        shapes.append(item)
    else:
        context.append(item)
result = {'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'countries':shapes, 'context':context}
(ROOT/'src/features/geography/data/europe-map.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(shapes)} country polygons, {len(context)} context outlines')
