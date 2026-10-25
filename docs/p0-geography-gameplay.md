# P0 geography and gameplay stabilization

The existing public-domain Natural Earth 1:50m vector dataset is retained. It has
41 multipart country outlines plus six stable marker-only IDs, within longitude
-26..46 and latitude 34..72 (864×570). Russia/Turkey are clipped to these European
map bounds. Natural Earth default de facto boundaries apply; Kosovo is the app's
historic KOS ID, northern Cyprus is context, overseas territories outside the
bounds are not selectable. This is a learning coverage convention, not a statement
about recognition. Geometry is simplified to 0.35 map units for mobile rendering.

Country paths now use even-odd fill so holes are not incorrectly filled. Tiny
outlines also have numbered alternative buttons, retaining the original six marker
numbers. Decorative point markers no longer enlarge map hit areas over a neighbour;
select marker-only countries via their explicit numbered buttons. Large countries
and islands use their own SVG paths. Name It wrong options stay visibly red and
disabled, with correct answers green. The map captures movement and suppresses the
release press after pan/pinch to prevent accidental guesses.

Distances are precomputed from the same multipart simplified outlines using the
existing local-km approximation (52N equirectangular metric). Marker land neighbours
are explicitly zero; marker sea distances use point-to-outline approximation.
Distinct IDs at zero distance are still wrong guesses. This is not geodesic survey
accuracy. Precomputation removes nested segment scans from the UI thread.

Regenerate after geometry/marker changes: `node scripts/build-border-distances.mjs`.
Table metadata includes the geometry SHA-256. Tests cover all 1081 distinct pairs,
finite nondegenerate rings, all 47 target IDs, marker neighbours, sea separation,
small-country alternatives, movement suppression and web event routing.
