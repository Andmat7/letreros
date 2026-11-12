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
- Locally: `.venv/Scripts/python tools/dev_server.py`, then open http://localhost:8020 (ES modules do not load from `file://`; this server turns off browser caching so old modules never mix with new ones, and open pages reload themselves when their files change).

- Before each commit run `python tools/stamp_versions.py`: it adds `?v=<hash>` to every module import so browsers skip GitHub Pages' 10-minute cache.

## What it is

An approximate 3D model of the La Riviera corner (Carrera 7 con Calle 12) with two removable boards, named after the street they face: `carrera_7` (the corner column, 0.30 × 1.40 m) and `calle_12` (0.60 × 2.00 m), whose design can be swapped in the panel. The scene can be rotated and zoomed, signs can be dragged along the walls, and camera icons mark where each photo was taken. A 1.70 m figure gives scale.

Choosing a photo moves the camera to where it was taken, with the same lens, and lays the photo over the view: the F key hides or shows it, "Foto" sets its transparency, "Lente" the field of view, and "Copiar cámara" copies the adjusted camera as a line for `src/data/photo_viewpoints.js`.

The 📏 Medir button measures between two clicked points; points stick to nearby edges and corners, the measurement runs straight along x, y or z, the dots can be dragged and "Copiar coordenadas" copies the result. Coordinates are in meters from the outer building corner: x goes negative along Calle 12, z goes negative along Carrera 7, y is the height above the road (the sidewalk is at 0.15).

## Layout

- `src/data/building_measurements.js` – every size of the building, windows and streets. Edit this file with the on-site measurements.
- `src/data/sign_catalog.js`, `src/data/photo_viewpoints.js` – signs and photo viewpoints.
- `src/scene/` – 3D geometry (streets, building, windows, details, surroundings).
- `src/interaction/` – sign dragging, photo markers, camera flights.
- `src/components/` – side panel and image viewer web components.
- `src/generated/photo_bundle.js` – built by `tools/build_photo_bundle.py`; do not edit by hand.
- `images/` – original photos and sign artwork: `signs/propuestas/` has the full proposals (named by their width x height ratio), `signs/partes/` the loose pieces to build them. `signs/partes/bancolombia_oscuro_1x4_6/` is that proposal cut into `fondos/` (bands without elements), `fotos/` (phones with hands, card and invoices cut out along their edges), `logos/` and `textos/`, made by `.venv/Scripts/python tools/cut_sign_parts.py`. `signs/partes/bancolombia_nueva_1x4_6/` is the newer proposal (white arrow bands) cut the same way by `cd tools && ../.venv/Scripts/python cut_new_sign_parts.py`; both boards show it by default. `signs/partes/daviplata_nueva_1x0_5/` is the Davivienda and Daviplata art (its height matches the Davivienda band of that proposal) cut into `fondos/`, `fotos/` (the phone) and `logos/`, made by `cd tools && ../.venv/Scripts/python cut_daviplata_parts.py`. The services section of the Calle 12 corner sign comes from `signs/propuestas/servicios_publicos_nueva.webp`, fitted to its slot and cut into pieces (texts, invoices, carrier logos) and pasted whole on `calle_12_layout.webp` by `cd tools && ../.venv/Scripts/python cut_servicios_parts.py` (then run `build_photo_bundle.py` again). Its title ("PAGA TUS SERVICIOS PÚBLICOS") and the "Y TAMBIÉN RECARGAS A" line are drawn in white with a blue shadow by `.venv/Scripts/python tools/make_text_pieces.py`, which also draws "RETIROS Y RECARGAS" under the Nequi logo and the big "RETIROS Y CONSIGNACIONES" (with "Corresponsal Bancolombia" small underneath) for Bancolombia; the slogans were left out so each service shows only its name and what it offers. The Nequi, Bancolombia and Davivienda bands are plain brand-color shadings drawn by `.venv/Scripts/python tools/make_plain_bands.py`, since the cut bands keep traces of the lifted texts. The DaviPlata logo loses its red box by `.venv/Scripts/python tools/key_daviplata_logo.py`. The services section has two columns, bills on the blue band on the left and "RECARGAS" on a charcoal panel on the right, with the carrier logos split one per piece by `.venv/Scripts/python tools/split_operator_logos.py`. Tigo and WOM use the round logos in `signs/propuestas/logo_tigo_original.jpg` and `logo_wom_original.jpg`, cut by `.venv/Scripts/python tools/cut_round_logos.py`. The copy shop at the bottom of that sign ("6. fotocopias") comes from `signs/propuestas/fotocopiadora_nueva.png`, cut into a flat background (with the white dotted line on Ésika red that separates it from the banking part on top), the arrow, two texts, the printer and the services panel by `.venv/Scripts/python tools/cut_fotocopias_parts.py`. The header of both boards ("en la tienda ÉSIKA, segundo local a la izquierda", from `signs/propuestas/encabezado_tienda_esika_referencia.png`) is drawn at print size, in white on the store red, into `signs/partes/encabezado_tienda_esika/ancho/` (Calle 12) and `columna/`, as `fondo` (the red band), `flecha_punta`, `flecha_cuerpo`, `texto_rojo` and `texto_azul` (both white now; they keep their first names so saved layouts still find them), by `.venv/Scripts/python tools/make_store_header_parts.py`; the column's version says "a la vuelta" with the curved arrow.

## Trying designs on the boards

The panel's "Probar diseños" section lets you pick a design for each board (blank, the proposals and the loose pieces), whether it fits whole or fills the board and cropped, and a 90° turn for wide designs on a tall board. Each design keeps its own ratio and sits on a white board; the choice is remembered in the browser. Add designs in `src/data/sign_artwork.js` (the image must be in `tools/build_photo_bundle.py`).

## Arranging the cut pieces

With the dev server running, open http://localhost:8020/tools/layout_editor/ to drag the pieces of `signs/partes/bancolombia_nueva_1x4_6/` (arrow keys nudge 1 px, Shift 10 px), scale them, make them wider or narrower ("ancho": 1 is the normal width; the header arrows are a tip, a turn on the column and a body that stay attached and centered on the tip: dragging any of them moves the whole arrow, the tip's scale sizes it, and a selected body shows "grosor" and "largo" for its thickness and length), reorder them, write a note per piece, set how tall each section is (the number next to its name, or drag the pink line between two sections; the space moves from one section to its neighbour) and each section has "Copiar imagen" (copies it as a PNG), "Eliminar imagen" (or the Delete key) takes the chosen image out of the sign and of every copy until you restore it, "Copiar imagen completa" copies the whole sign, "Vista final" hides every control mark, and "Copiar instrucciones" pastes the layout into the chat. Clicking an empty spot deselects. On the Calle 12 sign the sections under the header form two parts, Corresponsal (Nequi, Bancolombia, Davivienda and the public services last) and Fotocopiadora at the bottom; the percentage at the top of the panel (70 % to start) sets how much of that height Corresponsal gets: its sections resize in proportion and their pieces shrink or grow (as far as the width allows) and spread to fit. Corresponsal sits in an Ésika red frame with a purple border (Nequi's) and rounded corners that the editor draws at the group's size (`group_frame.js`), so its four sections read as one block while each keeps its colors. Ctrl or Shift+click chooses several pieces, which then move together and scale together with the handle, the wheel or + and −; "Agrupar" saves them as a group, so one click on any of them chooses them all again, and "Desagrupar" frees them.

### From the editor to the 3D page and the print PDF

1. Arrange each sign in the editor: http://localhost:8020/tools/layout_editor/?sign=carrera_7 and http://localhost:8020/tools/layout_editor/?sign=calle_12.
2. While the editor is open it saves the sign by itself, when it opens and a moment after every change (the "Guardar en 3D y PDF" button does it at once): the dev server saves it as `images/signs/propuestas/<sign>_layout.webp`, rebuilds `src/generated/photo_bundle.js` and writes `impresion/<sign>_<width>x<height>_cm.pdf`, sized from the image at 3200 px per meter (0.30 × 1.40 m and 0.60 × 2.00 m).
3. An open http://localhost:8020/ reloads itself and shows the new board. `.venv/Scripts/python tools/make_print_pdfs.py` writes both PDFs again from the saved layouts.
