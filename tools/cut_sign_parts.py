"""Cuts the proposal bancolombia_oscuro_1x4_6 into its parts so each one can be redesigned on its own.

Photos (phones with hands, card, invoices) are cut out along their real edges with GrabCut; logos and
texts are keyed against the band color; bands are rebuilt without them. `rebuild_preview` pastes the
parts back to prove the cut lost nothing.
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
BAND_ENDS = [430, 2017, 2878, 3649, 4142, SIGN_BOTTOM]
BAND_NAMES = ["flecha_superior", "nequi", "bancolombia", "servicios_publicos", "davivienda", "flecha_inferior"]
# Bands whose background is rebuilt row by row; the two white ones are kept whole.
REBUILT_BANDS = [1, 2, 3, 4]

# name: (folder, left, top, right, bottom, how it is cut)
PARTS = {
    "celular_nequi": ("fotos", 190, 1176, 773, 2017, "grabcut"),
    "tarjeta_bancolombia": ("fotos", 235, 2040, 750, 2470, "grabcut"),
    "facturas": ("fotos", 672, 2878, 960, 3380, "grabcut"),
    "celular_davivienda": ("fotos", 605, 3520, 960, 3950, "grabcut_sin_amarillo"),
    "logo_nequi": ("logos", 60, 790, 905, 1058, "grabcut"),
    "logo_bancolombia": ("logos", 85, 2464, 892, 2621, "key"),
    "iconos_servicios": ("logos", 325, 2923, 616, 3208, "key"),
    "logo_davivienda": ("logos", 49, 3685, 587, 3943, "opaque"),
    "logo_daviplata": ("logos", 190, 3976, 780, 4122, "key"),
    "texto_recarga": ("textos", 30, 565, 930, 665, "key"),
    "texto_corresponsal": ("textos", 112, 2654, 862, 2834, "key"),
    "texto_pago_servicios": ("textos", 123, 3214, 847, 3606, "key"),
}
KEY_THRESHOLD = 40
# The sign sits inside a black frame; the clean color of each row is sampled just inside it.
SIGN_LEFT, SIGN_RIGHT = 12, 946
SAMPLE_COLUMNS = slice(20, 40)
SURE_BACKGROUND_DISTANCE, PROBABLE_FOREGROUND_DISTANCE, SURE_FOREGROUND_DISTANCE = 40, 60, 150


class SignPartCutter:
    def __init__(self, project_root: Path):
        self.source = np.asarray(Image.open(project_root / SOURCE).convert("RGB"))
        self.output = project_root / OUTPUT

    def cut_all(self) -> None:
        backgrounds = self._rebuild_backgrounds()
        for name, (folder, left, top, right, bottom, method) in PARTS.items():
            box = (left, top, right, bottom)
            alpha = self._alpha(box, method, backgrounds)
            self._save(folder, name, self._crop(box), alpha)
        self._save_bands(backgrounds)

    def rebuild_preview(self) -> Image.Image:
        canvas = self._stack_bands()
        for name, (folder, left, top, _right, _bottom, _method) in PARTS.items():
            part = Image.open(self.output / folder / f"{name}.webp").convert("RGBA")
            canvas.alpha_composite(part, (left, top - SIGN_TOP))
        return canvas

    def _rebuild_backgrounds(self) -> np.ndarray:
        backgrounds = self.source.copy()
        for index in REBUILT_BANDS:
            top, bottom = self._band_rows(index)
            edge_column = np.median(self.source[top:bottom, SAMPLE_COLUMNS], axis=1)
            backgrounds[top:bottom, SIGN_LEFT:SIGN_RIGHT] = edge_column[:, None, :].astype(np.uint8)
        return backgrounds

    def _band_rows(self, index: int) -> tuple[int, int]:
        starts = [SIGN_TOP, *BAND_ENDS[:-1]]
        return starts[index], BAND_ENDS[index]

    def _crop(self, box: tuple) -> np.ndarray:
        left, top, right, bottom = box
        return self.source[top:bottom, left:right]

    def _alpha(self, box: tuple, method: str, backgrounds: np.ndarray) -> np.ndarray:
        crop = self._crop(box)
        if method == "opaque":
            return np.full(crop.shape[:2], 255, np.uint8)
        left, top, right, bottom = box
        distance = np.abs(crop.astype(int) - backgrounds[top:bottom, left:right].astype(int)).sum(axis=2)
        if method == "key":
            return np.clip(distance * 255 // (KEY_THRESHOLD * 2), 0, 255).astype(np.uint8)
        if method == "grabcut_sin_amarillo":
            distance = np.where(self._is_yellow_text(crop), 0, distance)
        return self._grabcut(crop, distance)

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

    def _save_bands(self, backgrounds: np.ndarray) -> None:
        (self.output / "fondos").mkdir(parents=True, exist_ok=True)
        starts = [SIGN_TOP, *BAND_ENDS[:-1]]
        for number, name in enumerate(BAND_NAMES, start=1):
            band = backgrounds[starts[number - 1]:BAND_ENDS[number - 1]]
            Image.fromarray(band).save(self.output / "fondos" / f"{number:02d}_{name}.webp", lossless=True)

    def _stack_bands(self) -> Image.Image:
        bands = [Image.open(path) for path in sorted((self.output / "fondos").glob("*.webp"))]
        canvas = Image.new("RGBA", (bands[0].width, sum(band.height for band in bands)))
        offset = 0
        for band in bands:
            canvas.paste(band, (0, offset))
            offset += band.height
        return canvas


if __name__ == "__main__":
    cutter = SignPartCutter(PROJECT_ROOT)
    cutter.cut_all()
    cutter.rebuild_preview().convert("RGB").save(PROJECT_ROOT / OUTPUT / "armada.webp", quality=95)
