// Build-time only; uses the project's pinned TypeScript compiler, no runtime GIS.
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const root = new URL('../', import.meta.url);
const temporary = mkdtempSync(join(tmpdir(), 'world-maps-distance-'));
try {
  const directory = new URL('src/features/geography/', root);
  for (const name of ['engine', 'europe', 'microstates', 'outlineDistance']) {
    const source = readFileSync(new URL(`${name}.ts`, directory), 'utf8');
    writeFileSync(join(temporary, `${name}.js`), ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    }).outputText);
  }
  mkdirSync(join(temporary, 'data'));
  const geometry = readFileSync(new URL('data/europe-map.json', directory));
  writeFileSync(join(temporary, 'data/europe-map.json'), geometry);
  const require = createRequire(join(temporary, 'index.js'));
  const { europePack } = require('./europe.js');
  const { outlineDistanceKm } = require('./outlineDistance.js');
  const distances = {};
  for (const a of europePack.locations) for (const b of europePack.locations) {
    if (a.id >= b.id) continue;
    distances[`${a.id}:${b.id}`] = Math.round(outlineDistanceKm(a, b) * 10) / 10;
  }
  writeFileSync(new URL('data/border-distances.json', directory), JSON.stringify({
    geometrySha256: createHash('sha256').update(geometry).digest('hex'),
    convention: 'Approximate minimum outline distances in a 52N local plane; marker land neighbours explicitly share a boundary.',
    distances,
  }, null, 2) + '\n');
  console.log(`Generated ${Object.keys(distances).length} symmetric country distances`);
} finally { rmSync(temporary, { recursive: true, force: true }); }
