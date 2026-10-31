"""Cuts the "A la vuelta en la tienda ÉSIKA" arrow into the pieces the layout editor moves.

The arrow is scaled to the sign width. Each piece keeps its own box, so it can be moved on its own. The
bands behind the arrows are blanked, because the artwork now lives in the pieces.
"""
from pathlib import Path

import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/flecha_esika_vuelta_nueva.webp"
OUTPUT = "images/signs/partes/flecha_esika_vuelta"
BANDS = "images/signs/partes/bancolombia_nueva_1x4_6/fondos"
SIGN_WIDTH = 960
# Boxes in pixels of the source arrow: name, left, top, right, bottom.
PIECES = {
    "flecha": (84, 37, 812, 640),
    "a_la_vuelta": (897, 92, 1938, 214),
    "linea_roja": (897, 246, 1938, 257),
    "en_la_tienda": (897, 290, 1938, 409),
    "logo_esika": (897, 447, 1938, 696),
}
# Bands the arrow sits in, as (file name, height in pixels), at sign width.
BLANK_BANDS = {"01_flecha_superior.webp": 370, "06_flecha_inferior.webp": 370}
# How strongly a pixel away from white turns opaque; light shadows stay faint.
# The logo is a solid red box whose white letters must stay opaque, so it is not keyed out of the white.
OPAQUE_PIECES = {"logo_esika"}
INK_FLOOR = 12
INK_STRENGTH = 4


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
        alpha = np.clip((distance - INK_FLOOR) * INK_STRENGTH, 0, 255).astype(np.uint8)
        if path.stem in OPAQUE_PIECES:
            alpha = np.full(alpha.shape, 255, np.uint8)
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
