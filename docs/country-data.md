# Offline country learning data

All 47 selectable map IDs have bundled English/Polish/Russian names, capitals and SVG flags.
No population, imagery or remote API is used. Country/territory coverage follows the
learning pack, not a definition of international recognition.

Names and capital relationships are a derived subset of **mledoze/countries**:
https://github.com/mledoze/countries/tree/6031f5df137c41c76d180c55a0782185ae3ed05b

The derived country facts database (`data/country-facts.json`, excluding flag artwork)
is made available under ODbL 1.0, with the source license in
[licenses/countries-ODbL.txt](licenses/countries-ODbL.txt). Polish and Russian capital city spellings
are editorial translations of the source capital names. `UNK` is mapped to the app's
existing `KOS` ID. Dataset checksum is embedded in the generated JSON.

Flags: **flag-icons v7.6.0**, commit
`0d8909b00aa8418802a5abf2afa82356b129a7ef`, 4:3 SVGs, MIT by Panayiotis Lipiridis:
https://github.com/lipis/flag-icons/tree/v7.6.0

Full license: [licenses/flag-icons-MIT.txt](licenses/flag-icons-MIT.txt).
The supplied flag artwork is bundled unchanged in the generated data. It uses the
existing SVG library, so rendering does not depend on OS flag emoji support.

To regenerate, download `countries.json` from the pinned countries revision and
flags/4x3 from the pinned flag-icons revision, then run:

```sh
python3 scripts/build-country-facts.py /path/to/countries.json /path/to/flags/4x3
```

The generator rejects missing IDs; tests cover names/capitals/flags for every map ID
and ensure flags do not reference remote images or scripts. Data is a snapshot
retrieved 2026-10-25; corrections should preserve stable map IDs and source notes.
