"""Cuts the Davivienda and Daviplata proposal daviplata_nueva_1x0_5 into the pieces of its section.

The proposal is scaled to the sign width. The logos are keyed against the clean red of their rows and the
phone is cut out with GrabCut; the background keeps the red without them, so it can take any height.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from cut_sign_parts import SIGN_WIDTH, SignPartCutter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/daviplata_nueva_1x0_5.webp"
OUTPUT = "images/signs/partes/daviplata_nueva_1x0_5"
BACKGROUND = "fondos/05_davivienda.webp"

# name: (folder, left, top, right, bottom, how it is cut), in pixels of the proposal scaled to the sign width.
PARTS = {
    "logo_davivienda": ("logos", 125, 40, 570, 230, "key"),
    "logo_daviplata": ("logos", 100, 265, 585, 440, "key"),
    "celular_davivienda": ("fotos", 655, 0, SIGN_WIDTH, 491, "grabcut"),
}


class DaviplataPartCutter(SignPartCutter):
    def __init__(self, project_root: Path):
        self.output = project_root / OUTPUT
        art = Image.open(project_root / SOURCE).convert("RGB")
        self.source = np.asarray(art.resize((SIGN_WIDTH, round(SIGN_WIDTH * art.height / art.width)), Image.LANCZOS))

    def cut_all(self) -> None:
        backgrounds = self._clean_background()
        self._cut_parts(PARTS, self.source, backgrounds)
        self._save_background()

    def _clean_background(self) -> np.ndarray:
        backgrounds = self.source.copy()
        for _folder, left, top, right, bottom, _method in PARTS.values():
            clean = self._clean_rows(self.source[top:bottom])
            backgrounds[top:bottom, left:right] = clean[:, left:right]
        return backgrounds

    def _save_background(self) -> None:
        # Flat rows would leave rectangles on the red gradient, so the pieces' boxes are filled from their surroundings.
        mask = np.zeros(self.source.shape[:2], np.uint8)
        for _folder, left, top, right, bottom, _method in PARTS.values():
            mask[top:bottom, left:right] = 255
        bgr = cv2.cvtColor(self.source, cv2.COLOR_RGB2BGR)
        filled = cv2.cvtColor(cv2.inpaint(bgr, mask, 9, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
        (self.output / "fondos").mkdir(parents=True, exist_ok=True)
        Image.fromarray(filled).save(self.output / BACKGROUND, lossless=True)


if __name__ == "__main__":
    DaviplataPartCutter(PROJECT_ROOT).cut_all()
