# Wikipedia discovery in Learn

Expanded country details (Learn and country collection) offer a direct English
Wikipedia article link and, where suitable photographs are available, up to three
photos from that country's article. Ambiguous titles such as Georgia, the two
Congos, Micronesia and Palestine have explicit country-article mappings.

Article links, captions, source pages, creator credits and licenses are bundled in
`data/wikipedia-gallery.json`. No API call is made by the app. No image is requested
until **Show photos** is pressed; compact gameplay cards never mount the gallery.
Maps, flags, facts and saved progress remain available offline. Remote image
failures show an offline-friendly placeholder with Retry; failed external link
opens show an inline error. A new country remounts the gallery with photos hidden.

Photos are displayed without cropping, with a caption and creator credit. Source
& author opens the original Commons file page (including full creator metadata),
and the license opens its Creative Commons terms or public-domain source page.
Captions and attribution retain their source spelling; controls are EN/PL/RU.
Images are selected as illustrative places/landscapes, not comprehensive or
canonical representations of a country. Some countries have fewer than three
eligible photos; their Wikipedia article link remains available.

## Refresh metadata

```sh
python3 scripts/build-wikipedia-gallery.py /tmp/world-maps-wiki-cache
```

The generator uses the MediaWiki Action API, with cached, rate-limited requests.
It filters article images by photographic format, dimensions and place/landscape
names, then requests Imageinfo metadata only for a shortlist. Entries without a
creator, recognized CC BY / BY-SA / CC0 / public-domain status, or trusted HTTPS
image/source destinations are rejected. Imageinfo license metadata is HTML; the
generator converts credits to plain text and the UI never renders remote HTML.
Review the resulting captions and source pages before committing refreshed data.
The generator downloads metadata, not image files.

API reference: https://www.mediawiki.org/wiki/API:Imageinfo
Attribution guidance: https://attribution.wikimedia.org/attribution-signals/license.html

This replaces the previous two automatically loaded Poland/Italy photos with a
shared optional gallery. No runtime dependency, storage schema or permission was
added. Photo availability and licenses can change upstream; refresh the metadata
when replacing gallery entries. No full Wikipedia articles are copied into the app.

Native image requests identify World Maps with a project URL in their User-Agent,
following [Wikimedia's policy](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy).
A generic `okhttp` agent returned HTTP 403 during verification; the identifying
agent returned 200 for the same photo. Web images use the browser's own user agent.
The pinned RN 0.86 Android Image implementation forwards headers only from its
array source branch. `countryPhotoSource` uses that supported native form and an
object source for React Native Web; no native configuration or dependency patch
is needed. Recheck this contract when upgrading React Native.

Current coverage: 174 article links, 394 photos across 172 countries. Republic of
the Congo and Djibouti currently have article links only. See
[validation and platform evidence](evidence/wikipedia-gallery/README.md).
