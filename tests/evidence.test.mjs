import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterRecords,parseView,viewQuery,dossier,validateLayerManifest} from '../lib/evidence.mjs';
const read = path => JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const data=read('../data/records.json');
const layerManifest=read('../data/layers.json');
const geo=read('../data/geo/monument-references.geojson');

test('tier threshold never reclassifies a record and confidence is independent',()=>{
 const all=filterRecords(data.records,'angkor-wat',2,'all');
 assert.equal(all.length,3);
 assert.deepEqual(all.map(r=>r.level),[0,1,2]);
 assert.deepEqual(filterRecords(data.records,'angkor-wat',2,'medium').map(r=>r.level),[0,1]);
 assert.deepEqual(filterRecords(data.records,'angkor-wat',2,'high').map(r=>r.level),[0]);
});
test('view links validate inputs and preserve selected filters',()=>{
 const ids=data.sites.map(s=>s.id);
 const state={siteId:'bayon',level:2,confidence:'high'};
 assert.deepEqual(parseView(viewQuery(state),ids),state);
 assert.deepEqual(parseView('?site=invalid&tier=99&confidence=broken',ids),{siteId:ids[0],level:0,confidence:'all'});
});
test('evidence dossier includes qualifications and linked sources',()=>{
 const txt=dossier(data.sites[0],filterRecords(data.records,'angkor-wat',1));
 assert.match(txt,/Uncertainty:/); assert.match(txt,/Confidence basis:/); assert.match(txt,/https:\/\/pmc/);
});
test('approved layers have publication metadata and valid local GeoJSON',()=>{
 assert.equal(validateLayerManifest(layerManifest.layers),true);
 assert.equal(geo.type,'FeatureCollection');
 const siteIds = new Set(data.sites.map(s=>s.id));
 for(const f of geo.features){
  assert.equal(f.geometry.type,'Point');
  assert.equal(f.properties.geometryStatus,'reference');
  assert.ok(siteIds.has(f.properties.siteId));
  const site=data.sites.find(s=>s.id===f.properties.siteId);
  assert.deepEqual(f.geometry.coordinates,site.coordinates);
 }
});
test('restricted or uncredited layers cannot enter the public manifest',()=>{
 assert.throws(()=>validateLayerManifest([{id:'restricted',path:'./data/geo/restricted.geojson',publicationApproved:false,geometryStatus:'surveyed',license:'restricted',attribution:'team',sourceUrl:'https://example.org'}]));
 assert.throws(()=>validateLayerManifest([{id:'bad',path:'../secrets.geojson',publicationApproved:true,geometryStatus:'surveyed',license:'CC',attribution:'test',sourceUrl:'https://example.org'}]));
});
