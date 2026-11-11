# Architecture and evidence schema (v0.2)

## Why a static site?

The atlas is a dependency-free site using MapLibre GL JS and a static JSON catalog. Node.js is required only for automated tests. This makes the project easy to audit, fork and deploy on GitHub Pages. The OSM public raster tile service is for low-volume development, not a guaranteed production service.

## Evidence and geography are independent

- `data/records.json`: scholarly claims, each linked to one site, an evidence `level` (0 documented / 1 interpreted / 2 proposed), a **separate** confidence judgment (high / medium / low), a confidence basis, uncertainty and specific citations.
- `data/geo/*.geojson`: geographic drawings. **A location isn't a proof of a nearby feature.** The initial three GeoJSON points are indicative gazetteer references, not LiDAR measurements or temple footprints.
- `data/layers.json`: reviewed publication manifest. The frontend refuses to load a layer that lacks `publicationApproved: true`, a license declaration, attribution, source URL and a geometry status.
- `lib/evidence.mjs`: pure functions shared between the browser and tests for filtering, permalinks and dossiers.

## Admission of a new geospatial layer

1. Check the rights and archaeology ethics detailed in `docs/data-policy.md`.
2. Convert approved source data to WGS84 GeoJSON, and document the original coordinate reference system, transformation and source vintage. **Do not transform restricted datasets that disallow re-georeferencing.**
3. Record collection license/attribution, the sponsoring research or heritage project, and a public source URL.
4. Give each feature `siteId` (if associated with a documented place), `evidenceLevel`, `confidence`, and `geometryStatus`. Use `reference`, `surveyed`, `interpretive`, or `hypothetical` honestly.
5. Submit a PR with methodological notes and test updates. Coordinate/location sensitivity review may require *not* publishing particular feature coordinates.
6. Add the reviewed file to the manifest only after explicit publication rights are confirmed. A boolean flag cannot grant rights—it merely records the human decision.

## Permalinks and evidence exports

The query parameters `site`, `tier`, and `confidence` encode the current research view. The Copy dossier action exports **visible records** with qualifications and source URLs, not an implied scholarly endorsement.

## Future terrain and 3D

A 2.5D terrain viewer can consume *approved* DEM tiles later; the map's geospatial features and the evidence catalog remain the authoritative linked references. Hypothetical buildings will attach to source IDs, dates and confidence metadata rather than be silently promoted to archaeological fact.
