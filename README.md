# Letreros – Carrera 7 con Calle 12

## Install (photo bundle tool)

```sh
python -m venv .venv
.venv/Scripts/python -m pip install -r tools/requirements.txt
.venv/Scripts/python tools/build_photo_bundle.py
.venv/Scripts/python tools/build_photo_edges.py
```

Run both builds again after changing anything in `images/`. The second one lists the straight edges of every photo (Canny + Hough) in `src/generated/photo_edges.js`.

## View

- Online: https://andmat7.github.io/letreros/
- Locally: `.venv/Scripts/python tools/dev_server.py`, then open http://localhost:8000 (ES modules do not load from `file://`; this server turns off browser caching so old modules never mix with new ones).

## What it is

An approximate 3D model of the La Riviera corner (Carrera 7 con Calle 12) with two removable boards (corner column and corner seen from Calle 12), whose design can be swapped in the panel. The scene can be rotated and zoomed, signs can be dragged along the walls, and camera icons mark where each photo was taken. A 1.70 m figure gives scale.

Choosing a photo moves the camera to where it was taken, with the same lens, and lays the photo over the view: the F key hides or shows it, "Foto" sets its transparency, "Lente" the field of view, and "Copiar cámara" copies the adjusted camera as a line for `src/data/photo_viewpoints.js`.

The 📏 Medir button measures between two clicked points; points stick to nearby edges and corners, the measurement runs straight along x, y or z, the dots can be dragged and "Copiar coordenadas" copies the result. Coordinates are in meters from the outer building corner: x goes negative along Calle 12, z goes negative along Carrera 7, y is the height above the road (the sidewalk is at 0.15).

## Layout

- `src/data/building_measurements.js` – every size of the building, windows and streets. Edit this file with the on-site measurements.
- `src/data/sign_catalog.js`, `src/data/photo_viewpoints.js` – signs and photo viewpoints.
- `src/scene/` – 3D geometry (streets, building, windows, details, surroundings).
- `src/interaction/` – sign dragging, photo markers, camera flights.
- `src/components/` – side panel and image viewer web components.
- `src/generated/photo_bundle.js` – built by `tools/build_photo_bundle.py`; do not edit by hand.
- `images/` – original photos and sign artwork: `signs/propuestas/` has the full proposals (named by their width x height ratio), `signs/partes/` the loose pieces to build them. `signs/partes/bancolombia_oscuro_1x4_6/` is that proposal cut into `fondos/` (bands without elements), `fotos/` (phones with hands, card and invoices cut out along their edges), `logos/` and `textos/`, made by `.venv/Scripts/python tools/cut_sign_parts.py`.

## Trying designs on the boards

The panel's "Probar diseños" section lets you pick a design for each board (blank, the proposals and the loose pieces), whether it fits whole or fills the board and cropped, and a 90° turn for wide designs on a tall board. Each design keeps its own ratio and sits on a white board; the choice is remembered in the browser. Add designs in `src/data/sign_artwork.js` (the image must be in `tools/build_photo_bundle.py`).

## Arranging the cut pieces

With the dev server running, open http://localhost:8000/tools/layout_editor/ to drag the pieces of `signs/partes/bancolombia_oscuro_1x4_6/` (arrow keys nudge 1 px, Shift 10 px), scale them, reorder them, write a note per piece and press "Copiar instrucciones" to paste the layout into the chat.
