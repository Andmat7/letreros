"""Cuts the proposal bancolombia_oscuro_1x4_6 into its parts so each one can be redesigned on its own.

Photos (phones with hands, card, invoices) are cut out along their real edges with GrabCut; logos and
texts are keyed against the band color; bands are rebuilt without them. The Nequi section has its own
art (fuentes/), so its pieces come from there and the Nequi band takes the art's proportion; the
Bancolombia band absorbs the height difference. The Bancolombia pieces come from art that already has a
transparent background, so they are only cropped.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/bancolombia_oscuro_1x4_6.webp"
OUTPUT = "images/signs/partes/bancolombia_oscuro_1x4_6"
SIGN_TOP, SIGN_BOTTOM = 60, 4442
# Rows where each band ends (the last one is the sign bottom).
BAND_ENDS = [430, 2017, 2878, 3213, 3649, 4142, SIGN_BOTTOM]
BAND_NAMES = ["flecha_superior", "nequi", "bancolombia", "servicios", "servicios_publicos", "davivienda", "flecha_inferior"]
# Bands whose background is rebuilt row by row; the two white ones are kept whole.
REBUILT_BANDS = [1, 2, 3, 4, 5]
# Bands replaced by new art (the originals are kept in fuentes/); cutting must not bring the old one back.
REPLACED_BANDS = {"flecha_superior", "flecha_inferior"}
NEQUI_ART = "fuentes/02_nequi_nueva.webp"
NEQUI_BAND, BANCOLOMBIA_BAND = 1, 2
SIGN_WIDTH = 960

# name: (folder, left, top, right, bottom, how it is cut)
PARTS = {
    "facturas": ("fotos", 672, 2878, 960, 3380, "grabcut"),
    "celular_davivienda": ("fotos", 605, 3520, 960, 3950, "grabcut_sin_amarillo"),
    "iconos_servicios": ("logos", 325, 2923, 616, 3208, "key"),
    "logo_davivienda": ("logos", 49, 3685, 587, 3943, "opaque"),
    "logo_daviplata": ("logos", 190, 3976, 780, 4122, "key"),
    "texto_pago_servicios": ("textos", 123, 3214, 847, 3606, "key"),
}
# Pieces of the Nequi art, boxes in pixels of the art scaled to the sign width.
NEQUI_PARTS = {
    "texto_recarga": ("textos", 50, 60, 895, 165, "key"),
    "logo_nequi": ("logos", 125, 190, 840, 425, "grabcut"),
    "destellos_izquierda": ("logos", 145, 505, 250, 612, "key"),
    "destellos_derecha": ("logos", 625, 555, 725, 695, "key"),
    "celular_nequi": ("fotos", 150, 425, 960, 1241, "grabcut"),
}
# Pieces of art that already has a transparent background (fuentes/); boxes are in pixels of that art.
BANCOLOMBIA_ART = "fuentes/03_bancolombia_nueva.webp"
BANCOLOMBIA_PARTS = {
    "tarjeta_bancolombia": ("fotos", 215, 40, 785, 490),
    "logo_bancolombia": ("logos", 75, 490, 962, 675),
    "texto_corresponsal": ("textos", 78, 672, 950, 862),
}
KEY_THRESHOLD = 40
# The sign sits inside a black frame; the clean color of each row is sampled just inside it.
SIGN_LEFT, SIGN_RIGHT = 12, 946
SAMPLE_COLUMNS = slice(20, 40)
SURE_BACKGROUND_DISTANCE, PROBABLE_FOREGROUND_DISTANCE, SURE_FOREGROUND_DISTANCE = 40, 60, 150


class SignPartCutter:
    def __init__(self, project_root: Path):
        self.output = project_root / OUTPUT
        self.source = np.asarray(Image.open(project_root / SOURCE).convert("RGB"))
        self.nequi_art = self._load_nequi_art()

    def _load_nequi_art(self) -> np.ndarray:
        art = Image.open(self.output / NEQUI_ART).convert("RGB")
        return np.asarray(art.resize((SIGN_WIDTH, round(SIGN_WIDTH * art.height / art.width)), Image.LANCZOS))

    def cut_all(self) -> None:
        backgrounds = self._rebuild_backgrounds()
        art_background = self._clean_rows(self.nequi_art)
        self._cut_parts(PARTS, self.source, backgrounds)
        self._cut_parts(NEQUI_PARTS, self.nequi_art, art_background)
        self._cut_transparent_art(BANCOLOMBIA_ART, BANCOLOMBIA_PARTS)
        self._save_bands(backgrounds, art_background)

    def _cut_parts(self, parts: dict, image: np.ndarray, backgrounds: np.ndarray) -> None:
        for name, (folder, left, top, right, bottom, method) in parts.items():
            box = (left, top, right, bottom)
            crop = image[top:bottom, left:right]
            self._save(folder, name, crop, self._alpha(crop, box, method, backgrounds))

    def _cut_transparent_art(self, art_path: str, parts: dict) -> None:
        art = np.asarray(Image.open(self.output / art_path).convert("RGBA"))
        for name, (folder, left, top, right, bottom) in parts.items():
            region = art[top:bottom, left:right]
            self._save(folder, name, region[..., :3], region[..., 3])

    def _rebuild_backgrounds(self) -> np.ndarray:
        backgrounds = self.source.copy()
        for index in REBUILT_BANDS:
            top, bottom = self._band_rows(index)
            backgrounds[top:bottom, SIGN_LEFT:SIGN_RIGHT] = self._clean_rows(self.source[top:bottom])[:, SIGN_LEFT:SIGN_RIGHT]
        return backgrounds

    @staticmethod
    def _clean_rows(image: np.ndarray) -> np.ndarray:
        edge_column = np.median(image[:, SAMPLE_COLUMNS], axis=1)
        return np.repeat(edge_column[:, None, :].astype(np.uint8), image.shape[1], axis=1)

    def _band_rows(self, index: int) -> tuple[int, int]:
        starts = [SIGN_TOP, *BAND_ENDS[:-1]]
        return starts[index], BAND_ENDS[index]

    @staticmethod
    def _alpha(crop: np.ndarray, box: tuple, method: str, backgrounds: np.ndarray) -> np.ndarray:
        if method == "opaque":
            return np.full(crop.shape[:2], 255, np.uint8)
        left, top, right, bottom = box
        distance = np.abs(crop.astype(int) - backgrounds[top:bottom, left:right].astype(int)).sum(axis=2)
        if method == "key":
            return np.clip(distance * 255 // (KEY_THRESHOLD * 2), 0, 255).astype(np.uint8)
        if method == "grabcut_sin_amarillo":
            distance = np.where(SignPartCutter._is_yellow_text(crop), 0, distance)
        return SignPartCutter._grabcut(crop, distance)

    @staticmethod
    def _is_yellow_text(crop: np.ndarray) -> np.ndarray:
        # The yellow letters of the band above touch this phone; the phone itself has no yellow.
        red, green, blue = (crop[..., channel].astype(int) for channel in range(3))
        return (red > 200) & (green > 150) & (blue < 100)

    @staticmethod
    def _grabcut(crop: np.ndarray, distance: np.ndarray) -> np.ndarray:
        # The clean band color tells GrabCut where the background surely is, so the hands are not lost.
        mask = np.full(crop.shape[:2], cv2.GC_PR_BGD, np.uint8)
        mask[distance > PROBABLE_FOREGROUND_DISTANCE] = cv2.GC_PR_FGD
        mask[distance < SURE_BACKGROUND_DISTANCE] = cv2.GC_BGD
        mask[distance > SURE_FOREGROUND_DISTANCE] = cv2.GC_FGD
        cv2.grabCut(cv2.cvtColor(crop, cv2.COLOR_RGB2BGR), mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 5, cv2.GC_INIT_WITH_MASK)
        foreground = np.isin(mask, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8) * 255
        main_object = SignPartCutter._largest_component(SignPartCutter._fill_holes(foreground))
        return cv2.GaussianBlur(main_object, (0, 0), 1.2)

    @staticmethod
    def _largest_component(foreground: np.ndarray) -> np.ndarray:
        # Letters of the neighbouring text fall inside some boxes; only the object itself is kept.
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        opened = cv2.morphologyEx(foreground, cv2.MORPH_OPEN, kernel)
        _count, labels, stats, _centroids = cv2.connectedComponentsWithStats(opened)
        largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        core = ((labels == largest) * 255).astype(np.uint8)
        return cv2.bitwise_and(foreground, cv2.dilate(core, kernel))

    @staticmethod
    def _fill_holes(foreground: np.ndarray) -> np.ndarray:
        padded = cv2.copyMakeBorder(foreground, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
        flooded = padded.copy()
        cv2.floodFill(flooded, None, (0, 0), 255)
        return (padded | cv2.bitwise_not(flooded))[1:-1, 1:-1]

    def _save(self, folder: str, name: str, crop: np.ndarray, alpha: np.ndarray) -> None:
        (self.output / folder).mkdir(parents=True, exist_ok=True)
        rgba = np.dstack([crop, alpha])
        Image.fromarray(rgba, "RGBA").save(self.output / folder / f"{name}.webp", lossless=True)

    def _save_bands(self, backgrounds: np.ndarray, art_background: np.ndarray) -> None:
        (self.output / "fondos").mkdir(parents=True, exist_ok=True)
        starts = [SIGN_TOP, *BAND_ENDS[:-1]]
        bands = [backgrounds[starts[index]:BAND_ENDS[index]] for index in range(len(BAND_NAMES))]
        bands[NEQUI_BAND] = art_background
        bands[BANCOLOMBIA_BAND] = self._resized_height(bands[BANCOLOMBIA_BAND], self._bancolombia_height(bands))
        for number, name in enumerate(BAND_NAMES, start=1):
            if name not in REPLACED_BANDS:
                Image.fromarray(bands[number - 1]).save(self.output / "fondos" / f"{number:02d}_{name}.webp", lossless=True)

    @staticmethod
    def _bancolombia_height(bands: list) -> int:
        # The Nequi and Bancolombia bands together keep the height they had in the original proposal.
        original_total = (BAND_ENDS[BANCOLOMBIA_BAND] - SIGN_TOP) - (BAND_ENDS[NEQUI_BAND - 1] - SIGN_TOP)
        return original_total - bands[NEQUI_BAND].shape[0]

    @staticmethod
    def _resized_height(band: np.ndarray, height: int) -> np.ndarray:
        return np.asarray(Image.fromarray(band).resize((band.shape[1], height), Image.LANCZOS))


if __name__ == "__main__":
    SignPartCutter(PROJECT_ROOT).cut_all()
