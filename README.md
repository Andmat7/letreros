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
- Locally: `.venv/Scripts/python tools/dev_server.py`, then open http://localhost:8020 (ES modules do not load from `file://`; this server turns off browser caching so old modules never mix with new ones).

- Before each commit run `python tools/stamp_versions.py`: it adds `?v=<hash>` to every module import so browsers skip GitHub Pages' 10-minute cache.

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
- `images/` – original photos and sign artwork: `signs/propuestas/` has the full proposals (named by their width x height ratio), `signs/partes/` the loose pieces to build them. `signs/partes/bancolombia_oscuro_1x4_6/` is that proposal cut into `fondos/` (bands without elements), `fotos/` (phones with hands, card and invoices cut out along their edges), `logos/` and `textos/`, made by `.venv/Scripts/python tools/cut_sign_parts.py`. `signs/partes/bancolombia_nueva_1x4_6/` is the newer proposal (white arrow bands) cut the same way by `cd tools && ../.venv/Scripts/python cut_new_sign_parts.py`; both boards show it by default. `signs/partes/daviplata_nueva_1x0_5/` is the Davivienda and Daviplata art (its height matches the Davivienda band of that proposal) cut into `fondos/`, `fotos/` (the phone) and `logos/`, made by `cd tools && ../.venv/Scripts/python cut_daviplata_parts.py`. The services section of the Calle 12 corner sign comes from `signs/propuestas/servicios_publicos_nueva.webp`, fitted to its slot and cut into pieces (texts, invoices, carrier logos) and pasted whole on `esquina_calle_12_layout.webp` by `cd tools && ../.venv/Scripts/python cut_servicios_parts.py` (then run `build_photo_bundle.py` again). The new section at the bottom of that sign ("6. sección nueva", fotocopias and the "en el primer local" arrow) is drawn by `.venv/Scripts/python tools/make_new_section_parts.py`. The header of both boards ("en la tienda ÉSIKA, segundo local a la izquierda", from `signs/propuestas/encabezado_tienda_esika_referencia.png`) is drawn at print size into `signs/partes/encabezado_tienda_esika/ancho/` (Calle 12) and `columna/`, as `flecha_punta`, `flecha_cuerpo`, `texto_rojo` and `texto_azul`, by `.venv/Scripts/python tools/make_store_header_parts.py`; the column's version says "a la vuelta" with the curved arrow.

## Trying designs on the boards

The panel's "Probar diseños" section lets you pick a design for each board (blank, the proposals and the loose pieces), whether it fits whole or fills the board and cropped, and a 90° turn for wide designs on a tall board. Each design keeps its own ratio and sits on a white board; the choice is remembered in the browser. Add designs in `src/data/sign_artwork.js` (the image must be in `tools/build_photo_bundle.py`).

## Arranging the cut pieces

With the dev server running, open http://localhost:8020/tools/layout_editor/ to drag the pieces of `signs/partes/bancolombia_nueva_1x4_6/` (arrow keys nudge 1 px, Shift 10 px), scale them, make them wider or narrower ("ancho": 1 is the normal width; the header arrows are a tip and a body, so widening the body lengthens the arrow), reorder them, write a note per piece, set how tall each section is (the number next to its name, or drag the pink line between two sections; the space moves from one section to its neighbour) and each section has "Copiar imagen" (copies it as a PNG), "Eliminar imagen" (or the Delete key) takes the chosen image out of the sign and of every copy until you restore it, "Copiar imagen completa" copies the whole sign, "Vista final" hides every control mark, and "Copiar instrucciones" pastes the layout into the chat.

### From the editor to the 3D page and the print PDF

1. Arrange each sign in the editor: http://localhost:8020/tools/layout_editor/?sign=columna_esquina and http://localhost:8020/tools/layout_editor/?sign=esquina_calle_12.
2. Press "Guardar en 3D y PDF". The dev server saves the sign as `images/signs/propuestas/<sign>_layout.webp`, rebuilds `src/generated/photo_bundle.js` and writes `impresion/<sign>_<width>x<height>_cm.pdf`, sized from the image at 3200 px per meter (0.30 × 1.40 m and 0.60 × 2.00 m).
3. Reload http://localhost:8020/ to see it on the 3D board. `.venv/Scripts/python tools/make_print_pdfs.py` writes both PDFs again from the saved layouts.
