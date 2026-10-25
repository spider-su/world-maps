"""Crop public-domain Natural Earth I 1:50m shaded relief to the SVG projection.
Build-time Pillow only. Usage: python3 scripts/build-atlas.py /path/NE1_50M_SR.tif
Source and license: docs/atlas-data.md. No raster download at app runtime.
"""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image

source = Path(sys.argv[1])
world = [float(line) for line in source.with_suffix('.tfw').read_text().splitlines()]
xscale, yskew, xskew, yscale, xcenter, ycenter = world
assert xskew == yskew == 0 and xscale > 0 and yscale < 0
west, south, east, north = -26, 34, 46, 72
xedge, yedge = xcenter - xscale / 2, ycenter - yscale / 2
box = ((west-xedge)/xscale, (north-yedge)/yscale, (east-xedge)/xscale, (south-yedge)/yscale)
root = Path(__file__).resolve().parents[1]
output = root/'assets/maps/europe-atlas.jpg'
output.parent.mkdir(parents=True, exist_ok=True)
with Image.open(source) as image:
    # Match x=(lon+26)*12, y=(72-lat)*15, at 2x SVG resolution.
    atlas = image.convert('RGB').transform((1728,1140), Image.Transform.EXTENT, box, Image.Resampling.BICUBIC)
    atlas.save(output, quality=90, optimize=True, progressive=True)
metadata = {
 'source':'Natural Earth I 1:50m Shaded Relief 3.2.0',
 'url':'https://naturalearth.s3.amazonaws.com/50m_raster/NE1_50M_SR.zip',
 'license':'Public domain', 'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
 'assetSha256':hashlib.sha256(output.read_bytes()).hexdigest(),
 'bounds':{'west':west,'south':south,'east':east,'north':north},
 'width':1728,'height':1140,'mapWidth':864,'mapHeight':570,
}
(root/'src/features/geography/data/atlas.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(f'{output}: {output.stat().st_size} bytes')
