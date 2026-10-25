# Offline atlas presentation

Home and Learn use a bundled Natural Earth I 1:50m Shaded Relief 3.2.0 raster.
Source: https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-1/
Download: https://naturalearth.s3.amazonaws.com/50m_raster/NE1_50M_SR.zip
License: public domain, https://www.naturalearthdata.com/about/terms-of-use/
Credit: Made with Natural Earth, Tom Patterson and Nathaniel Vaughn Kelso.

`scripts/build-atlas.py` reads the supplied WGS84 plate-carrée TIFF/world file,
crops -26..46 longitude / 34..72 latitude and resamples to 1728×1140. It uses
exactly x=(longitude+26)*12, y=(72-latitude)*15 at 2x resolution, matching the
political SVG. Build-time Pillow is needed only to regenerate the committed asset.
Input/output checksums and bounds live in `data/atlas.json`; no asset downloads
or external providers are used by the running app.

The relief image is decorative and clipped to the authoritative political land
paths; the SVG sea supplies blue water. Country paths remain the sole geographic
hit-test layer. Both layers are children of the same viewBox, so pan and zoom apply
to them together. Learn can hide borders; selected land has a translucent blue
highlight, with names/flags/capitals in the existing panel. Quiz modes keep neutral
land and their legible feedback colors. No AI-created geographic imagery is used.

The earlier globe-and-compass icon, blue shell and mode accents from merged #12
are retained. The current app intentionally supports a light appearance; OS dark
mode must remain readable but is not advertised as an alternate app theme.
