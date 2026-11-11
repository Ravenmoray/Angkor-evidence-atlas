# Angkor Evidence Atlas

> **A map that distinguishes what was observed, what was inferred, and what we have merely imagined.**

Angkor Evidence Atlas is an open-source, evidence-first web explorer for the archaeological landscape of Angkor, Cambodia. It is intended to become a research-friendly bridge between published archaeological observations and future historical 3D visualizations.

**Status: v0.2 / working research prototype, NOT a LiDAR visualization or historic reconstruction.** The initial map shows three documented monuments as indicative, source-linked **reference points**. Published interpretations and hypothetical model concepts are attached to those places as annotated records; they are not plotted as survey-grade geometries.

## Quick start

No build dependencies, account, or database are needed. A static web server is required to load the local JSON file:

```bash
cd angkor-evidence-atlas
python3 -m http.server 8000
# Open http://localhost:8000/
```

The browser loads MapLibre GL JS from jsDelivr and map tiles from OpenStreetMap. Thus an internet connection is required for the base map; no tracking scripts are installed by this project.

## What works in v0.2

- Interactive, zoomable georeferenced map of **Angkor Wat, Bayon, and Ta Prohm**.
- Click map pins or the site list to inspect a place.
- An **evidence threshold slider**: Documented → Interpreted → Proposed.
- Site-specific source-linked claims, uncertainty notes, and explicit labels.
- Works as a static site, including GitHub Pages.
- A source-linked JSON evidence catalog plus a separate **GeoJSON layer manifest** that rejects layers without declared publication approval and licensing.
- An **independent confidence filter**, in addition to evidence tier.
- Shareable filtered-view links and a copyable source-linked evidence dossier.
- Automated tests and continuous integration for evidence and layer metadata.

The slider **filters claims by evidentiary status**, not historical age or raw LiDAR layers. It is deliberately impossible for a proposed model to silently become documented evidence when the control changes.

## Project principles

1. **Observed ≠ interpreted ≠ reconstructed.** Each layer is distinguishable.
2. **No citation, no archaeological claim.** Claims must link to sources, preferably primary research or heritage authorities.
3. **Never invent precise geometries.** Monument markers are not ancient settlement footprints.
4. **State uncertainty explicitly.** Include an explanation of what the source does *not* support.
5. **Preserve data rights.** Dataset permissions, attribution, and redistribution restrictions are separate from code licensing.
6. **Respect a living heritage landscape.** Avoid presenting contemporary residents and communities as if they have vanished.

## Data model

The catalog lives at [`data/records.json`](data/records.json), and map features are registered in [`data/layers.json`](data/layers.json). `sites` contain indicative reference locations (longitude, latitude in WGS84). `records` attach an archaeological statement to a site with a numeric `level`:

| Level | Name | Intended meaning |
|---|---|---|
| `0` | Documented | A surviving monument or independently documented observation |
| `1` | Interpreted | A published archaeological inference from observations |
| `2` | Proposed | A possible visual reconstruction or research proposal, explicitly not verified |

**Confidence is independent of evidence tier:** a documented statement can have qualifications, and a proposed reconstruction cannot become an observation by sliding a control. The initial confidence values are editorial assessments pending expert review. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Research starting points

- UNESCO World Heritage Centre, [Angkor](https://whc.unesco.org/en/list/668/).
- Evans et al. (2013), [*Uncovering archaeological landscapes at Angkor using lidar*](https://pmc.ncbi.nlm.nih.gov/articles/PMC3732978/), *PNAS*.
- Evans (2016), [*Airborne laser scanning as a method for exploring long-term socio-ecological dynamics in Cambodia*](https://www.sciencedirect.com/science/article/pii/S0305440316300644), *Journal of Archaeological Science*.
- [Virtual Angkor methodology](https://www.virtualangkor.com/technology), a related, independently authored reconstruction and research initiative; its assets are **not** bundled in this repository.

## Licensing and attribution

- Original code and original project documentation: **MIT** ([`LICENSE`](LICENSE)).
- Third-party sources, mapping, imagery, geographic databases, LiDAR and model assets: **not covered by the MIT project code license**. Inspect their individual terms before importing or redistributing.
- Base map: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), subject to OSM's separate terms. The basemap uses OSM's public raster tile server, which is suitable for development and light traffic only; see [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before a public launch.

See [`docs/data-policy.md`](docs/data-policy.md) for source and rights guidance, and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the layer admission process. **No restricted LiDAR files are bundled here.**

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Early contributions should focus on **catalog auditability and properly permitted datasets**, rather than speculative visual richness.

## Deploy to GitHub Pages

1. Create a **public** GitHub repository (suggested name `angkor-evidence-atlas`).
2. Push the contents of this project to its `main` branch.
3. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
4. The bundled workflow deploys the static site after pushes to `main`.

## Tests

```bash
node --test tests/*.test.mjs
```

Requires Node.js 18+ for the built-in test runner.

---

*This is an independent open research tool, not endorsed by UNESCO, Cambodian heritage authorities, or the Virtual Angkor team.*
