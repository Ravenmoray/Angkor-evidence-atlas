/** Pure evidence functions: usable by both the browser and Node tests. */
export const TIERS = [
  {name:'Documented', description:'Directly documented sites and observations.'},
  {name:'Interpreted', description:'Also show published archaeological interpretations.'},
  {name:'Proposed', description:'Also show clearly labeled hypothetical reconstruction concepts.'}
];
export const CONFIDENCE = {low:1, medium:2, high:3};
export const DEFAULT_STATE = Object.freeze({siteId:'angkor-wat', level:0, confidence:'all'});
export function filterRecords(records, siteId, level, confidence='all') {
  return records.filter(r => r.siteId===siteId && r.level<=level &&
    (confidence==='all' || CONFIDENCE[r.confidence] >= CONFIDENCE[confidence]));
}
export function parseView(search, siteIds) {
  const params = new URLSearchParams(search);
  const site = params.get('site');
  const tier = Number(params.get('tier'));
  const c = params.get('confidence');
  return {
    siteId:siteIds.includes(site) ? site : siteIds[0] || DEFAULT_STATE.siteId,
    level:params.has('tier') && Number.isInteger(tier) && tier>=0 && tier<=2 ? tier : 0,
    confidence:['all','medium','high'].includes(c) ? c : 'all'
  };
}
export function viewQuery(state) {
  const params = new URLSearchParams();
  params.set('site',state.siteId); params.set('tier',String(state.level));
  params.set('confidence',state.confidence);
  return `?${params.toString()}`;
}
export function dossier(site, records) {
  const lines = [`ANGKOR EVIDENCE ATLAS — ${site.name}`,site.period,site.summary,'',
    'NOTE: Indicative reference location; this is not a survey-grade footprint.',''];
  for(const r of records){
    lines.push(`${TIERS[r.level].name.toUpperCase()} · ${r.confidence.toUpperCase()} CONFIDENCE — ${r.title}`,
      r.statement,`Uncertainty: ${r.uncertainty}`,`Confidence basis: ${r.confidenceBasis}`);
    for(const s of r.sources) lines.push(`Source: ${s.title} — ${s.url}`);
    lines.push('');
  }
  return lines.join('\n');
}
/** Publicly displayed overlays must be marked publishable and carry attribution. */
export function validateLayerManifest(layers){
  if(!Array.isArray(layers)) throw new Error('Layer manifest must be an array');
  const ids=new Set();
  for(const l of layers){
    if(ids.has(l.id) || !l.id) throw new Error(`Invalid or duplicate layer ID: ${l.id}`);
    ids.add(l.id);
    if(!/^\.\/data\/geo\/[\w.-]+\.geojson$/.test(l.path)) throw new Error(`Unsafe layer path: ${l.id}`);
    if(l.publicationApproved!==true || !l.license || !l.attribution || !l.sourceUrl?.startsWith('https://'))
      throw new Error(`Layer ${l.id} lacks publication approval, license or attribution`);
    if(!['reference','surveyed','interpretive','hypothetical'].includes(l.geometryStatus))
      throw new Error(`Layer ${l.id} missing geometry status`);
  }
  return true;
}
