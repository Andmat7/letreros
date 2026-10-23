# Letreros – Carrera 7 con Calle 12

## Install (photo bundle tool)

```sh
python -m venv .venv
.venv/Scripts/python -m pip install -r tools/requirements.txt
.venv/Scripts/python tools/build_photo_bundle.py
```

Run the build again after changing anything in `images/`.

## View

- Online: https://andmat7.github.io/letreros/
- Locally: `.venv/Scripts/python -m http.server 8000`, then open http://localhost:8000 (ES modules do not load from `file://`).

## What it is

An approximate 3D model of the La Riviera corner (Carrera 7 con Calle 12) with proposed sign placements (Bancolombia, Nequi). The scene can be rotated and zoomed, signs can be dragged along the walls, and camera icons mark where each photo was taken. A 1.70 m figure gives scale.

The 📏 Medir button measures between two clicked points; points stick to nearby edges and corners, the measurement runs straight along x, y or z, the dots can be dragged and "Copiar coordenadas" copies the result. Coordinates are in meters from the outer building corner: x goes negative along Calle 12, z goes negative along Carrera 7, y is the height above the road (the sidewalk is at 0.15).

## Layout

- `src/data/building_measurements.js` – every size of the building, windows and streets. Edit this file with the on-site measurements.
- `src/data/sign_catalog.js`, `src/data/photo_viewpoints.js` – signs and photo viewpoints.
- `src/scene/` – 3D geometry (streets, building, windows, details, surroundings).
- `src/interaction/` – sign dragging, photo markers, camera flights.
- `src/components/` – side panel and image viewer web components.
- `src/generated/photo_bundle.js` – built by `tools/build_photo_bundle.py`; do not edit by hand.
- `images/` – original photos and sign artwork.
