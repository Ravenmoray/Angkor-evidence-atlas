import {TIERS, CONFIDENCE, filterRecords, parseView, viewQuery, dossier, validateLayerManifest} from './lib/evidence.mjs';

const $ = id => document.getElementById(id);
const state = { data:null, level:0, confidence:'all', siteId:'angkor-wat', map:null, layers:[], mapReady:false, enabledLayers:new Set() };
const isSafeUrl = url => { try{return new URL(url).protocol==='https:';}catch{return false;} };

function sourceLink(source) {
  const a=document.createElement('a');
  if(isSafeUrl(source.url)) {a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';}
  a.textContent=`${source.title} ↗`;
  return a;
}
function siteById(id){return state.data.sites.find(s=>s.id===id);}
function filtered(){return filterRecords(state.data.records,state.siteId,state.level,state.confidence);}
function notice(message){$('action-status').textContent=message;}
function buildSiteList(){
  $('site-count').textContent=`${state.data.sites.length} PLACES`;
  const list=$('site-list');list.replaceChildren();
  for(const site of state.data.sites){
    const btn=document.createElement('button');btn.className=`site${site.id===state.siteId?' selected':''}`;
    btn.type='button';btn.setAttribute('aria-pressed',String(site.id===state.siteId));
    const words=document.createElement('span');
    const name=document.createElement('div');name.className='site-name';name.textContent=site.name;
    const date=document.createElement('div');date.className='site-sub';date.textContent=site.period;
    const arrow=document.createElement('span');arrow.className='site-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    words.append(name,date);btn.append(words,arrow);
    btn.addEventListener('click',()=>selectSite(site.id,true));list.append(btn);
  }
}
function renderRecords(){
  const site=siteById(state.siteId);
  $('site-title').textContent=site.name;
  $('site-period').textContent=site.period;
  $('site-description').textContent=site.summary;
  const records=filtered();$('claim-count').textContent=String(records.length).padStart(2,'0');
  const list=$('records');list.replaceChildren();
  if(!records.length){
    const empty=document.createElement('p');empty.className='empty-state';
    empty.textContent='No claims match these filters. Lower the confidence threshold or increase the evidence tier.';
    list.append(empty);return;
  }
  for(const record of records){
    const card=document.createElement('article');card.className='record';
    const badges=document.createElement('div');badges.className='record-badges';
    const tag=document.createElement('span');tag.className=`tag ${['documented','interpreted','proposed'][record.level]}`;tag.textContent=TIERS[record.level].name;
    const confidence=document.createElement('span');confidence.className='confidence-tag';confidence.textContent=`${record.confidence} confidence`;
    badges.append(tag,confidence);
    const title=document.createElement('h3');title.textContent=record.title;
    const body=document.createElement('p');body.textContent=record.statement;
    const uncertainty=document.createElement('div');uncertainty.className='uncertainty';uncertainty.textContent=`Limit: ${record.uncertainty}`;
    const basis=document.createElement('div');basis.className='basis';basis.textContent=`Confidence basis: ${record.confidenceBasis}`;
    const sources=document.createElement('div');sources.className='sources';
    record.sources.forEach(s=>sources.append(sourceLink(s)));
    card.append(badges,title,body,uncertainty,basis,sources);list.append(card);
  }
}
function updateSlider(){
  $('evidence-slider').value=String(state.level);
  $('evidence-slider').style.background=`linear-gradient(90deg, var(--gold) ${state.level*50}%, #43544f ${state.level*50}%)`;
  $('level-title').textContent=TIERS[state.level].name;
  $('level-description').textContent=TIERS[state.level].description;
  $('tier-counter').textContent=`0${state.level+1} / 03`;
  $('confidence-filter').value=state.confidence;
  renderRecords();syncMapFilters();
}
function persistView(){history.replaceState(null,'',`${location.pathname}${viewQuery(state)}${location.hash}`);}
function selectSite(id,move=false){
  if(!siteById(id))return;
  state.siteId=id;buildSiteList();renderRecords();syncMapFilters();persistView();
  if(move && state.mapReady){
    const site=siteById(id);
    state.map.flyTo({center:site.coordinates,zoom:Math.max(state.map.getZoom(),14),essential:true,duration:900});
  }
}
function acceptedConfidence(){
  return Object.entries(CONFIDENCE).filter(([,rank])=>state.confidence==='all'||rank>=CONFIDENCE[state.confidence]).map(([name])=>name);
}
function syncMapFilters(){
  if(!state.mapReady)return;
  const confidenceExpr=['in',['get','confidence'],['literal',acceptedConfidence()]];
  for(const l of state.layers){
    const visible=state.enabledLayers.has(l.id) ? 'visible':'none';
    const filter=['all',['<=',['get','evidenceLevel'],state.level],confidenceExpr];
    for(const suffix of ['fill','line','point']){
      const id=`layer-${l.id}-${suffix}`;
      if(state.map.getLayer(id)){state.map.setFilter(id,filter);state.map.setLayoutProperty(id,'visibility',visible);}
    }
  }
  if(state.map.getLayer('selected-halo')){
    state.map.setFilter('selected-halo',['all',['==',['get','siteId'],state.siteId],['<=',['get','evidenceLevel'],state.level],confidenceExpr]);
    state.map.setLayoutProperty('selected-halo','visibility',state.enabledLayers.has('monument-references')?'visible':'none');
  }
}
function layerList(){
  const container=$('layer-list');container.replaceChildren();
  for(const layer of state.layers){
    const row=document.createElement('label');row.className='layer-item';
    const input=document.createElement('input');input.type='checkbox';input.checked=state.enabledLayers.has(layer.id);
    input.addEventListener('change',()=>{if(input.checked)state.enabledLayers.add(layer.id);else state.enabledLayers.delete(layer.id);syncMapFilters();});
    const content=document.createElement('span');
    const name=document.createElement('strong');name.textContent=layer.title;
    const detail=document.createElement('small');detail.textContent=layer.dataStatement;
    content.append(name,detail);row.append(input,content);container.append(row);
  }
}
async function getJSON(path){const response=await fetch(path);if(!response.ok)throw new Error(`Failed to load ${path}: ${response.status}`);return response.json();}
async function initMap(){
  if(!window.maplibregl){$('map-failure').hidden=false;return;}
  const map=new maplibregl.Map({
    container:'map',center:[103.867,13.432],zoom:12.1,minZoom:7,maxZoom:19,attributionControl:true,
    style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'}},layers:[{id:'osm',type:'raster',source:'osm'}]}
  });
  state.map=map;map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
  map.on('error',e=>{console.warn('Map issue:',e.error?.message||e);});
  map.on('load',async()=>{
    try{
      for(const l of state.layers){
        const geo=await getJSON(l.path);
        if(geo.type!=='FeatureCollection')throw new Error(`Invalid GeoJSON for ${l.id}`);
        const id=`layer-${l.id}`;map.addSource(id,{type:'geojson',data:geo});
        // Only documented reference points are present today. Additional geometries require reviewed source and publication rights.
        map.addLayer({id:`${id}-fill`,type:'fill',source:id,filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':'#aa8357','fill-opacity':.22}});
        map.addLayer({id:`${id}-line`,type:'line',source:id,filter:['in',['geometry-type'],['literal',['LineString','Polygon']]],paint:{'line-color':'#bd8850','line-width':2,'line-dasharray':[3,2]}});
        map.addLayer({id:`${id}-point`,type:'circle',source:id,filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':8,'circle-color':'#bc7b31','circle-stroke-color':'#fff','circle-stroke-width':2.2}});
        map.on('click',`${id}-point`,e=>{const sid=e.features?.[0]?.properties?.siteId;if(sid)selectSite(sid,false);});
        map.on('mouseenter',`${id}-point`,()=>map.getCanvas().style.cursor='pointer');
        map.on('mouseleave',`${id}-point`,()=>map.getCanvas().style.cursor='');
      }
      if(map.getSource('layer-monument-references')){
        map.addLayer({id:'selected-halo',type:'circle',source:'layer-monument-references',paint:{'circle-radius':20,'circle-color':'#e4a853','circle-opacity':.18,'circle-stroke-width':2,'circle-stroke-color':'#ae7934','circle-stroke-opacity':.75}},'layer-monument-references-point');
      }
      state.mapReady=true;syncMapFilters();$('map-failure').hidden=true;
    }catch(e){console.error(e);$('map-failure').hidden=false;$('map-failure').querySelector('p').textContent=e.message;}
  });
  $('reset-map').addEventListener('click',()=>map.fitBounds([[103.835,13.392],[103.909,13.459]],{padding:60,duration:850}));
}
async function copyText(text,success){
  try{await navigator.clipboard.writeText(text);notice(success);}catch{notice('Clipboard access unavailable. Use the URL bar or browser copy controls.');}
}
async function start(){
  try{
    const [data,manifest]=await Promise.all([getJSON('./data/records.json'),getJSON('./data/layers.json')]);
    validateLayerManifest(manifest.layers);
    state.data=data;state.layers=manifest.layers;state.enabledLayers=new Set(state.layers.map(l=>l.id));
    Object.assign(state,parseView(location.search,data.sites.map(s=>s.id)));
    buildSiteList();layerList();updateSlider();
    $('evidence-slider').addEventListener('input',e=>{state.level=Number(e.target.value);updateSlider();persistView();});
    $('confidence-filter').addEventListener('change',e=>{state.confidence=e.target.value;updateSlider();persistView();});
    $('share-view').addEventListener('click',()=>copyText(location.href,'Link to this view copied.'));
    $('copy-dossier').addEventListener('click',()=>copyText(dossier(siteById(state.siteId),filtered()),'Source-linked evidence dossier copied.'));
    window.addEventListener('popstate',()=>{Object.assign(state,parseView(location.search,data.sites.map(s=>s.id)));buildSiteList();updateSlider();});
    if(document.readyState!=='complete')await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    await initMap();
  }catch(err){$('records').textContent=`Could not load the evidence catalog: ${err.message}. Run a static HTTP server (python3 -m http.server 8000).`;console.error(err);}
}
start();
