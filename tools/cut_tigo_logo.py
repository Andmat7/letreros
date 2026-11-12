"""Cuts the round Tigo logo out of images/signs/propuestas/logo_tigo_original.jpg (a blue circle on white) into
logos/logo_tigo_circulo.webp of the Calle 12 sign, with a smooth transparent edge, for the carrier grid.
Run from the project root: .venv/Scripts/python tools/cut_tigo_logo.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = PROJECT_ROOT / "images/signs/propuestas/logo_tigo_original.jpg"
TARGET = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/logos/logo_tigo_circulo.webp"
# Blue pixels are clearly bluer than red; the circle is the box around them.
BLUE_MARGIN = 60
# The mask is drawn this many times larger and scaled down, for a smooth edge, and pulled in a little so no white
# from the photo's background shows at the rim.
SUPERSAMPLE = 4
RIM_INSET = 2


class TigoLogoCutter:
    def cut(self):
        photo = Image.open(SOURCE).convert("RGB")
        pixels = np.asarray(photo).astype(int)
        rows, columns = np.nonzero(pixels[..., 2] - pixels[..., 0] > BLUE_MARGIN)
        box = (columns.min() + RIM_INSET, rows.min() + RIM_INSET, columns.max() - RIM_INSET, rows.max() - RIM_INSET)
        logo = photo.crop(box).convert("RGBA")
        logo.putalpha(self._round_mask(logo.size))
        logo.save(TARGET, lossless=True)
        print(f"{TARGET.name}: {logo.width}x{logo.height}")

    def _round_mask(self, size):
        mask = Image.new("L", (size[0] * SUPERSAMPLE, size[1] * SUPERSAMPLE), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, mask.width - 1, mask.height - 1), fill=255)
        return mask.resize(size, Image.LANCZOS)


if __name__ == "__main__":
    TigoLogoCutter().cut()
