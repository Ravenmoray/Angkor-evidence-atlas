# Data and evidence policy

## Three concepts that must never be conflated

- **Observation:** a feature or monument exists and is documented in a research, heritage, or ground survey record. The map may use a reference point; this is not automatically a precise geometry.
- **Interpretation:** an archaeologist's inference about the age, use, or relationship of a feature, with method and source available for review.
- **Proposed reconstruction:** a historically informed depiction or 3D model that may combine several kinds of evidence. It is a hypothesis, not a photograph of the past.

The slider currently exposes these three tiers. Do not convert a hypothesis into a surveyed footprint simply to make the map look more complete.

## Dataset admission checklist

Before adding GIS layers or assets:

1. Identify the **rights holder**, source URL, version, and data acquisition date.
2. Check a license or obtain **explicit written reuse and redistribution permission**. Access to an article does not grant unrestricted reuse of underlying LiDAR point clouds or derived terrain products.
3. Preserve provenance: publication, author, archive ID, original CRS, coordinate transformations, and data processing steps.
4. Distinguish spatial accuracy: reference point, approximate polygon, digitized map, field survey, or LiDAR-derived geometry.
5. Add chronology, uncertainty and confidence **separately**. A low-confidence 12th-century inference is not the same thing as a securely dated observed feature.
6. Avoid disclosing precise locations of unprotected or sensitive archaeological sites where disclosure could increase looting risks.
7. Consider consultations with Cambodian archaeologists, heritage authorities, and local experts before publishing detailed claims or culturally sensitive models.
8. Check that a dependency's external tile or imagery service permits the planned traffic and redistribution.

## Included records

The three starter locations are indicative points for **Angkor Wat**, **Bayon**, and **Ta Prohm**, linked respectively to Vici.org, Mapcarta/OSM, and GeoNames location references. Their existence as monuments is supported by [UNESCO's Angkor overview](https://whc.unesco.org/en/list/668/). The urban-grid and regional urban-landscape interpretations cite [Evans et al. 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3732978/) and [Evans 2016](https://www.sciencedirect.com/science/article/pii/S0305440316300644). The proposed dwelling layer contains **no geometry or model** and points to [Virtual Angkor's discussion of methodology](https://www.virtualangkor.com/technology).

These initial facts and coordinates are for a demonstrator. Before shipping a larger derived database, review each source's dataset terms, including OpenStreetMap's Open Database License where applicable.

## Data requests for future phases

- Survey-derived **DTM/hillshade** and mound/waterwork feature geometries with clear written rights.
- Georeferenced survey inventory with coordinate precision, source fields, and review metadata.
- Period-specific architectural evidence, with explicit uncertainty and Cambodian scholarly review.

## Basemap policy

This prototype accesses OpenStreetMap's public tile endpoint directly. It should not be used for high-traffic production deployment. If usage grows, migrate to a production tile provider or self-host with appropriate terms. Do not scrape or bulk-download public tiles.

## Licensing boundary

The MIT license applies to original code and project-authored documentation. **Third-party datasets, source texts, cartographic products, 3D models, photographs, and LiDAR are not sublicensed by this repository.**

## Verified research/data leads (November 2026)

- **[Archaeoscape, Zenodo record 14409524](https://zenodo.org/records/14409524)** offers high-resolution LiDAR-derived topography and archaeological annotations on a credentialed access basis. Its terms prohibit **re-georeferencing, commercial use and redistribution**. It is therefore **not eligible** for direct publication as a georeferenced public atlas layer without a separate affirmative agreement.
- **[Open Heritage 3D: Angkor Wat Western Causeway](https://openheritage3d.org/project.php?id=vngf-1h12)** lists terrestrial laser scans under **CC BY-NC-SA**, with download by request. This is *not* a public-domain source, and the license imposes additional requirements. It is also a monument-specific scan, not a forest-wide aerial LiDAR dataset.
- **[Cambodian Ministry of Culture / CISARK](https://cisark.mcfa.gov.kh/index.php)** has an official archaeological site inventory and interactive map. Treat the site's records as an important reference, not a grant of bulk redistribution rights.
- **[APSARA Authority](https://apsaraauthority.gov.kh/our-work/map-of-protected-areas/)** maintains official protected-area mapping. Its website and images are not assumed to be freely redistributable datasets.
- The direct OSM raster basemap is governed by the **[OSMF tile usage policy](https://operations.osmfoundation.org/policies/tiles/)**; do not prefetch tiles or assume the service is suitable for heavy public traffic.
