"""Build the offline Europe learning subset. No runtime data downloads.
python3 scripts/build-country-facts.py countries.json /path/to/flag-icons/flags/4x3
Sources/pinned revisions/licenses: docs/country-data.md
"""
import hashlib
import json
from pathlib import Path
import sys

root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
flags=Path(sys.argv[2])
ids=set(json.loads((root/'src/features/geography/data/europe-locations.json').read_text())) | {'AND','LIE','MCO','SMR','VAT','MLT'}
# Editorial Polish city-name translations; the capital relationship comes from source.
pl_capitals={
 'AUT':'Wiedeń','BEL':'Bruksela','BGR':'Sofia','BIH':'Sarajewo','BLR':'Mińsk',
 'CHE':'Berno','CYP':'Nikozja','CZE':'Praga','DNK':'Kopenhaga','ESP':'Madryt',
 'FRA':'Paryż','GBR':'Londyn','GRC':'Ateny','HRV':'Zagrzeb','HUN':'Budapeszt',
 'ISL':'Reykjavík','ITA':'Rzym','KOS':'Prisztina','LTU':'Wilno','LUX':'Luksemburg',
 'LVA':'Ryga','MCO':'Monako','MDA':'Kiszyniów','POL':'Warszawa','PRT':'Lizbona',
 'ROU':'Bukareszt','RUS':'Moskwa','SMR':'San Marino','SRB':'Belgrad','SVK':'Bratysława',
 'SVN':'Lublana','SWE':'Sztokholm','UKR':'Kijów','VAT':'Watykan',
}
result={}
for row in json.loads(source.read_text()):
    country_id='KOS' if row['cca3']=='UNK' else row['cca3']
    if country_id not in ids:
        continue
    capital=', '.join(row['capital'])
    code=row['cca2'].lower()
    result[country_id]={
      'name':{'en':row['name']['common'],'pl':row['translations']['pol']['common']},
      'capital':{'en':capital,'pl':pl_capitals.get(country_id,capital)},
      'flagCode':code.upper(), 'flagSvg':(flags/f'{code}.svg').read_text().strip(),
    }
assert set(result)==ids, f'Missing facts: {ids-set(result)}'
output={'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'countries':result}
(root/'src/features/geography/data/country-facts.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(f'Generated facts and flags for all {len(result)} locations')
