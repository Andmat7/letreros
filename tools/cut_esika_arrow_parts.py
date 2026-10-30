"""Cuts the "A la vuelta en la tienda ÉSIKA" arrow into the pieces the layout editor moves.

The arrow is scaled to the sign width. Each piece keeps its own box, so it can be moved on its own. The
bands behind the arrows are blanked, because the artwork now lives in the pieces.
"""
from pathlib import Path

import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/flecha_esika_vuelta.webp"
OUTPUT = "images/signs/partes/flecha_esika_vuelta"
BANDS = "images/signs/partes/bancolombia_nueva_1x4_6/fondos"
SIGN_WIDTH = 960
# Boxes in pixels of the source arrow: name, left, top, right, bottom.
PIECES = {
    "flecha": (177, 69, 819, 635),
    "a_la_vuelta": (972, 103, 1907, 210),
    "linea_roja": (972, 241, 1907, 248),
    "en_la_tienda": (972, 283, 1907, 390),
    "logo_esika": (972, 442, 1907, 675),
}
# Bands the arrow sits in, as (file name, height in pixels), at sign width.
BLANK_BANDS = {"01_flecha_superior.webp": 370, "06_flecha_inferior.webp": 299}
# How strongly a pixel away from white turns opaque; light shadows stay faint.
INK_STRENGTH = 3


class ArrowPartCutter:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.source = Image.open(project_root / SOURCE).convert("RGB")
        self.scale = SIGN_WIDTH / self.source.width

    def cut_all(self) -> None:
        output = self.project_root / OUTPUT
        output.mkdir(parents=True, exist_ok=True)
        for name, box in PIECES.items():
            self._save_piece(output / f"{name}.webp", box)
        self._save_blank_bands()

    def _save_piece(self, path: Path, box: tuple) -> None:
        crop = self.source.crop(box)
        size = (round(crop.width * self.scale), round(crop.height * self.scale))
        pixels = np.asarray(crop.resize(size, Image.LANCZOS)).astype(int)
        distance = np.abs(pixels - 255).sum(axis=2)
        alpha = np.clip(distance * INK_STRENGTH, 0, 255).astype(np.uint8)
        piece = np.dstack([pixels.astype(np.uint8), alpha])
        Image.fromarray(piece, "RGBA").save(path, lossless=True)

    def _save_blank_bands(self) -> None:
        for name, height in BLANK_BANDS.items():
            Image.new("RGB", (SIGN_WIDTH, height), (255, 255, 255)).save(self.project_root / BANDS / name, lossless=True)


if __name__ == "__main__":
    cutter = ArrowPartCutter(PROJECT_ROOT)
    cutter.cut_all()
    for name, (left, top, _, _) in PIECES.items():
        print(name, round(left * cutter.scale), round(top * cutter.scale))
