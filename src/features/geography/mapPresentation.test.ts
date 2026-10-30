import { describe, expect, it } from 'vitest';
import { MAP_IDS, maps } from './maps';
import { boundsForPoints, mapBounds, mapRegions, overviewViewport, regionBounds, shapeRings, targetViewport } from './mapPresentation';
import { frame, pan, zoomAt } from './viewport';

describe('continent framing and regional insets', () => {
 it.each(MAP_IDS)('keeps all %s geography reachable in Whole map', id => {
  const map = maps[id];
  for (const aspect of [0.65, 1.4, 2]) {
   const visible = frame(overviewViewport(map, aspect, true), aspect);
   for (const shape of map.shapes) {
    for (const point of [...shapeRings(shape.path).flat(), {x:shape.labelX,y:shape.labelY}]) {
     expect(point.x).toBeGreaterThanOrEqual(visible.x);expect(point.x).toBeLessThanOrEqual(visible.x+visible.w);
     expect(point.y).toBeGreaterThanOrEqual(visible.y);expect(point.y).toBeLessThanOrEqual(visible.y+visible.h);
    }
   }
  }
 });
 it.each(MAP_IDS)('retains every %s country anchor in the overview or a regional map', id => {
  const map = maps[id], bounds = mapBounds(map);
  const insetIds = mapRegions(id).flatMap(region=>[...region.countryIds]);
  for (const location of map.pack.locations) {
   if (insetIds.includes(location.id)) continue;
   const point = map.markers.find(p=>p.id===location.id) ?? map.shapes.find(p=>p.id===location.id)!;
   const x='labelX' in point ? point.labelX : point.x, y='labelY' in point ? point.labelY : point.y;
   expect(x).toBeGreaterThanOrEqual(bounds.x);expect(x).toBeLessThanOrEqual(bounds.x+bounds.w);
   expect(y).toBeGreaterThanOrEqual(bounds.y);expect(y).toBeLessThanOrEqual(bounds.y+bounds.h);
  }
  for(const region of mapRegions(id)) {
   expect(region.countryIds.every(country=>map.pack.locations.some(p=>p.id===country))).toBe(true);
   const box=regionBounds(map,region);expect(box.w).toBeGreaterThan(0);expect(box.h).toBeGreaterThan(0);
  }
  expect(new Set(insetIds).size).toBe(insetIds.length);
 });
 it('uses the portrait area for narrow continents and separates island regions',()=>{
  expect(mapBounds(maps['south-america']).w).toBeLessThan(400);
  expect(mapBounds(maps['north-america']).w).toBeLessThan(460);
  expect(mapRegions('north-america')[0]!.countryIds).toContain('BRB');
  expect(mapRegions('oceania').flatMap(r=>[...r.countryIds])).toHaveLength(11);
 });
 it('preserves custom bounds during pan/zoom and focuses small targets',()=>{
  const initial=overviewViewport(maps.africa,1.4);
  const zoomed=zoomAt(initial,2,{x:140,y:190},390,1.4);
  expect(zoomed.bounds).toEqual(initial.bounds);
  expect(pan(zoomed,20,20,390,1.4).bounds).toEqual(initial.bounds);
  const focus=targetViewport(maps.europe,'VAT',1.4);const visible=frame(focus,1.4);
  const marker=maps.europe.markers.find(p=>p.id==='VAT')!;
  expect(marker.x).toBeGreaterThanOrEqual(visible.x);expect(marker.x).toBeLessThanOrEqual(visible.x+visible.w);
  expect(targetViewport(maps['north-america'],'BRB',1.4)).toEqual(overviewViewport(maps['north-america'],1.4));
 });
 it('parses all bundled absolute straight-line geometry without dropping coordinates',()=>{
  for(const map of Object.values(maps))for(const shape of map.shapes){
   expect(shape.path.replace(/[MLZ\d\s.,-]/g,'')).toBe('');
   if(shape.path)expect(shapeRings(shape.path).length).toBeGreaterThan(0);
  }
  expect(boundsForPoints([{x:10,y:20},{x:30,y:50}],2)).toEqual({x:8,y:18,w:24,h:34});
 });
});
