"""Cuts the proposal bancolombia_nueva_1x4_6 into its parts, the same way cut_sign_parts.py cuts the dark one.

The proposal is scaled to the sign width. Photos are cut out with GrabCut and logos and texts are keyed
against the clean color of their band; the bands are saved without those elements. The two arrow bands
are artwork, so they are kept whole.
"""
from pathlib import Path

import numpy as np
from PIL import Image

from cut_sign_parts import KEY_THRESHOLD, SIGN_WIDTH, SignPartCutter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/bancolombia_nueva_1x4_6.webp"
OUTPUT = "images/signs/partes/bancolombia_nueva_1x4_6"
# Rows where each band ends once the proposal is scaled to 960 px wide (the last one is the sign bottom).
BAND_ENDS = [370, 1610, 2419, 3587, 4080, 4379]
BAND_NAMES = ["flecha_superior", "nequi", "bancolombia", "servicios", "davivienda", "flecha_inferior"]
ARTWORK_BANDS = {"flecha_superior", "flecha_inferior"}
# The black frame of the sign ends here; the clean color of each row is sampled just inside it.
SIGN_LEFT, SIGN_RIGHT = 14, 946
SAMPLE_COLUMNS = slice(16, 26)
# A row whose sampled color is this far from its band's usual color is covered by an element.
COVERED_ROW_DISTANCE = 60
# Compression noise in the flat bands would leave a faint haze around keyed logos and texts.
NOISE_FLOOR = 24

# name: (folder, left, top, right, bottom, how it is cut), in pixels of the scaled proposal.
PARTS = {
    "texto_recarga": ("textos", 50, 430, 895, 535, "key"),
    "logo_nequi": ("logos", 125, 560, 840, 795, "grabcut"),
    "destellos_izquierda": ("logos", 145, 875, 250, 982, "key"),
    "destellos_derecha": ("logos", 625, 925, 725, 1065, "key"),
    "celular_nequi": ("fotos", 150, 795, 960, 1610, "grabcut"),
    "tarjeta_bancolombia": ("fotos", 240, 1625, 730, 2000, "grabcut"),
    "logo_bancolombia": ("logos", 50, 2005, 935, 2175, "key"),
    "texto_corresponsal": ("textos", 100, 2215, 880, 2375, "key"),
    "texto_pago_servicios": ("textos", 60, 2465, 900, 2680, "key"),
    "facturas": ("fotos", 14, 2705, 946, 3510, "grabcut"),
    "logo_davivienda": ("logos", 50, 3625, 595, 3875, "key"),
    "logo_daviplata": ("logos", 190, 3895, 780, 4078, "key"),
    "celular_davivienda": ("fotos", 600, 3460, 950, 3895, "grabcut"),
}


class NewSignPartCutter(SignPartCutter):
    def __init__(self, project_root: Path):
        self.output = project_root / OUTPUT
        art = Image.open(project_root / SOURCE).convert("RGB")
        self.source = np.asarray(art.resize((SIGN_WIDTH, round(SIGN_WIDTH * art.height / art.width)), Image.LANCZOS))

    def cut_all(self) -> None:
        backgrounds = self._clean_backgrounds()
        for name, (folder, left, top, right, bottom, method) in PARTS.items():
            crop = self.source[top:bottom, left:right]
            self._save(folder, name, crop, self._alpha(crop, (left, top, right, bottom), method, backgrounds))
        self._save_bands(backgrounds)

    @staticmethod
    def _alpha(crop: np.ndarray, box: tuple, method: str, backgrounds: np.ndarray) -> np.ndarray:
        if method != "key":
            return SignPartCutter._alpha(crop, box, method, backgrounds)
        left, top, right, bottom = box
        distance = np.abs(crop.astype(int) - backgrounds[top:bottom, left:right].astype(int)).sum(axis=2)
        return np.clip((distance - NOISE_FLOOR) * 255 // (KEY_THRESHOLD * 2), 0, 255).astype(np.uint8)

    def _clean_backgrounds(self) -> np.ndarray:
        backgrounds = self.source.copy()
        for top, bottom in self._band_rows():
            clean = self._band_color(self.source[top:bottom])
            backgrounds[top:bottom, SIGN_LEFT:SIGN_RIGHT] = clean[:, None, :]
        return backgrounds

    @staticmethod
    def _band_color(band: np.ndarray) -> np.ndarray:
        row_colors = np.median(band[:, SAMPLE_COLUMNS], axis=1)
        usual_color = np.median(row_colors, axis=0)
        covered = np.abs(row_colors - usual_color).sum(axis=1) > COVERED_ROW_DISTANCE
        return np.where(covered[:, None], usual_color, row_colors).astype(np.uint8)

    @staticmethod
    def _band_rows() -> list[tuple[int, int]]:
        return list(zip([0, *BAND_ENDS[:-1]], BAND_ENDS))

    def _save_bands(self, backgrounds: np.ndarray) -> None:
        (self.output / "fondos").mkdir(parents=True, exist_ok=True)
        for number, (name, (top, bottom)) in enumerate(zip(BAND_NAMES, self._band_rows()), start=1):
            band = self.source if name in ARTWORK_BANDS else backgrounds
            Image.fromarray(band[top:bottom]).save(self.output / "fondos" / f"{number:02d}_{name}.webp", lossless=True)


if __name__ == "__main__":
    NewSignPartCutter(PROJECT_ROOT).cut_all()
