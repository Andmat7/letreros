"""Draws plain backgrounds for the Nequi, Bancolombia and Davivienda bands of the Calle 12 sign and the top-ups
panel, in each brand's color with a soft diagonal shading. The cut bands keep faint traces of the texts and logos that were lifted off
them, which show once a piece is left out. Run from the project root: .venv/Scripts/python tools/make_plain_bands.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/fondos_lisos"
# Each band as its size (as the cut band, so its stretch in the editor stays the same) and its dark and light color,
# sampled from the band.
BANDS = {
    "02_nequi": ((1920, 937), (34, 10, 56), (64, 20, 104)),
    "03_bancolombia": ((1920, 740), (16, 16, 16), (38, 37, 36)),
    "05_davivienda": ((1920, 951), (184, 4, 4), (236, 24, 26)),
    # Not a band: the panel behind the top-ups column of the services section, so it reads apart from the bills.
    "panel_recargas": ((700, 1260), (14, 14, 14), (48, 47, 46)),
    # The same panel as a strip across the bottom of the column sign's services section.
    "panel_recargas_columna": ((960, 390), (14, 14, 14), (48, 47, 46)),
}


class PlainBandMaker:
    def make_all(self):
        OUTPUT.mkdir(parents=True, exist_ok=True)
        for name, (size, dark, light) in BANDS.items():
            self._shaded(size, dark, light).save(OUTPUT / f"{name}.webp", quality=95)
            print(f"{name}: {size[0]}x{size[1]}")

    # Light at the top left, dark at the bottom right, with a gentle curve so the middle stays rich.
    def _shaded(self, size, dark, light):
        width, height = size
        columns, rows = np.meshgrid(np.linspace(0, 1, width), np.linspace(0, 1, height))
        darkness = np.clip((columns * 0.6 + rows * 0.4), 0, 1) ** 1.3
        colors = np.array(light) + (np.array(dark) - np.array(light)) * darkness[..., None]
        return Image.fromarray(colors.round().astype(np.uint8), "RGB")


if __name__ == "__main__":
    PlainBandMaker().make_all()
