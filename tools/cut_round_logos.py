"""Cuts the round carrier logos (Tigo and WOM, each a colored circle on white in images/signs/propuestas/) into the
logos/ folder of the Calle 12 sign, with a smooth transparent edge, for the carrier grid.
Run from the project root: .venv/Scripts/python tools/cut_round_logos.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCES = PROJECT_ROOT / "images/signs/propuestas"
LOGOS = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/logos"
LOGO_FILES = {"logo_tigo_original.jpg": "logo_tigo_circulo", "logo_wom_original.jpg": "logo_wom_circulo"}
# Pixels darker than this in some channel belong to the circle; the circle is the box around them.
WHITE_FROM = 200
# The mask is drawn this many times larger and scaled down, for a smooth edge, and pulled in a little so no white
# from the photo's background shows at the rim.
SUPERSAMPLE = 4
RIM_INSET = 2


class RoundLogoCutter:
    def cut_all(self):
        for source, target in LOGO_FILES.items():
            logo = self._cut(Image.open(SOURCES / source).convert("RGB"))
            logo.save(LOGOS / f"{target}.webp", lossless=True)
            print(f"{target}: {logo.width}x{logo.height}")

    def _cut(self, photo):
        rows, columns = np.nonzero(np.asarray(photo).min(axis=2) < WHITE_FROM)
        box = (columns.min() + RIM_INSET, rows.min() + RIM_INSET, columns.max() - RIM_INSET, rows.max() - RIM_INSET)
        logo = photo.crop(box).convert("RGBA")
        logo.putalpha(self._round_mask(logo.size))
        return logo

    def _round_mask(self, size):
        mask = Image.new("L", (size[0] * SUPERSAMPLE, size[1] * SUPERSAMPLE), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, mask.width - 1, mask.height - 1), fill=255)
        return mask.resize(size, Image.LANCZOS)


if __name__ == "__main__":
    RoundLogoCutter().cut_all()
