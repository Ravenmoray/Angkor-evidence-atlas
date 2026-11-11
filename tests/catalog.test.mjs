import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync(new URL('../data/records.json', import.meta.url), 'utf8'));
const sites = new Map(catalog.sites.map(s => [s.id, s]));

test('reference sites have unique IDs, in-range coordinates, and valid source links', () => {
  assert.equal(sites.size, catalog.sites.length);
  for (const site of catalog.sites) {
    const [lon, lat] = site.coordinates;
    assert.ok(lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90);
    assert.ok(/^https:\/\//.test(site.locationReference.url));
  }
});

test('every record has an auditable site, evidence tier, uncertainty and sources', () => {
  assert.equal(new Set(catalog.records.map(r => r.id)).size, catalog.records.length);
  for (const record of catalog.records) {
    assert.ok(sites.has(record.siteId), `unknown site ${record.siteId}`);
    assert.ok([0,1,2].includes(record.level));
    assert.ok(record.statement?.trim());
    assert.ok(record.uncertainty?.trim());
    assert.ok(record.sources.length > 0);
    for (const source of record.sources) assert.match(source.url, /^https:\/\//);
  }
});

test('a proposed reconstruction is never represented as directly observed', () => {
  const proposed = catalog.records.filter(r => r.level === 2);
  assert.ok(proposed.length > 0);
  assert.ok(proposed.every(r => /proposal|future|hypothetical|concept/i.test(r.statement + r.uncertainty)));
});
