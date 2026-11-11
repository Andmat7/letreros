"""Pastes the new store header (from tools/make_store_header_parts.py) over the old arrow strips of the finished
board layouts, so the 3D boards and the print PDFs show it. Run from the project root:
.venv/Scripts/python tools/paste_store_header.py
"""
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
HEADERS = PROJECT_ROOT / "images/signs/partes/encabezado_tienda_esika"
LAYOUTS = PROJECT_ROOT / "images/signs/propuestas"
# Layout, header art, and the white strips it replaces as (top, bottom) in pixels of the layout.
STRIPS = [
    ("columna_esquina_layout", "encabezado_columna", [(0, 400), (4157, 4480)]),
    ("esquina_calle_12_layout", "encabezado_ancho", [(0, 580)]),
]
MARGIN = 20


class StoreHeaderPaster:
    def paste_all(self):
        for layout_name, header_name, strips in STRIPS:
            layout_path = LAYOUTS / f"{layout_name}.webp"
            layout = Image.open(layout_path).convert("RGB")
            content = self._content(Image.open(HEADERS / f"{header_name}.webp").convert("RGB"))
            for top, bottom in strips:
                layout.paste(self._strip(content, layout.width, bottom - top), (0, top))
            layout.save(layout_path, lossless=True)
            print(f"{layout_name}: {len(strips)} strip(s) replaced")

    # The header without its white margin, so it can be fitted to strips of any height.
    def _content(self, header):
        inverted = Image.eval(header.convert("L"), lambda value: 255 - value)
        return header.crop(inverted.point(lambda value: 255 if value > 16 else 0).getbbox())

    def _strip(self, content, width, height):
        scale = min(1, (height - 2 * MARGIN) / content.height)
        fitted = content.resize((round(content.width * scale), round(content.height * scale)), Image.LANCZOS)
        strip = Image.new("RGB", (width, height), "white")
        strip.paste(fitted, ((width - fitted.width) // 2, (height - fitted.height) // 2))
        return strip


if __name__ == "__main__":
    StoreHeaderPaster().paste_all()
