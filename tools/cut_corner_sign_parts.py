"""Cuts the Calle 12 corner proposal into the pieces of each section, so every piece moves on its own.

The proposal is scaled to the 0.60 m board, 1920 px wide. Photos are cut out along their edges with GrabCut,
logos and texts are keyed against the band color, and every band is rebuilt without them.
"""
from pathlib import Path

import numpy as np
import cv2
from PIL import Image

from cut_sign_parts import SignPartCutter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/esquina_calle_12_nueva_0x6_1x4.webp"
OUTPUT = "images/signs/partes/esquina_calle_12_nueva"
BOARD_WIDTH = 1920
# Rows of the proposal where each band starts and ends.
BAND_ROWS = [("01_cabecera", 0, 204), ("02_nequi", 204, 532), ("03_bancolombia", 532, 791), ("04_servicios", 791, 1235), ("05_davivienda", 1235, 1568)]
# Outside these columns the bands keep their rounded corners.
REBUILT_LEFT, REBUILT_RIGHT = 120, 1800
# A pixel this far from its row's clean color is an element; the rest of the band keeps its gradient.
ELEMENT_DISTANCE = 60
INPAINT_RADIUS = 5
SAMPLE_COLUMNS = slice(130, 170)

# The card is the complete one from the column sign, fitted without distortion inside the card's place in this
# proposal (left, top, right, bottom in board pixels), above the Bancolombia logo.
CARD_ART = "images/signs/partes/bancolombia_nueva_1x4_6/fotos/tarjeta_bancolombia.webp"
CARD_BOX = (606, 1545, 1194, 1830)

# Pieces as (band, folder, name, left, top, right, bottom, how it is cut), in pixels of the proposal before scaling.
PIECES = [
    ("01_cabecera", "textos", "texto_a_la_vuelta", 318, 18, 532, 136, "key"),
    ("01_cabecera", "textos", "texto_tagline", 36, 152, 640, 190, "key"),
    ("01_cabecera", "logos", "flecha", 130, 8, 302, 142, "key"),
    ("02_nequi", "textos", "texto_recarga", 84, 222, 590, 278, "key"),
    ("02_nequi", "logos", "logo_nequi", 60, 296, 424, 412, "key"),
    ("02_nequi", "textos", "texto_hazlo_facil", 120, 458, 405, 506, "key"),
    ("02_nequi", "fotos", "celular_nequi", 420, 282, 640, 534, "grabcut"),
    ("03_bancolombia", "logos", "logo_bancolombia", 92, 638, 548, 713, "key_sin_amarillo"),
    ("03_bancolombia", "textos", "texto_corresponsal", 148, 712, 524, 780, "key"),
    ("04_servicios", "textos", "texto_pago_servicios", 96, 806, 578, 904, "key"),
    ("04_servicios", "textos", "texto_servicios_lista", 166, 904, 508, 938, "key"),
    ("04_servicios", "fotos", "facturas", 56, 938, 632, 1170, "grabcut"),
    ("04_servicios", "logos", "iconos_servicios", 100, 1172, 570, 1228, "key"),
    ("05_davivienda", "logos", "logo_davivienda", 130, 1258, 420, 1370, "key"),
    ("05_davivienda", "logos", "logo_daviplata", 106, 1382, 444, 1496, "opaque"),
    ("05_davivienda", "fotos", "celular_davivienda", 466, 1248, 628, 1484, "grabcut"),
    ("05_davivienda", "textos", "texto_envia", 116, 1514, 540, 1548, "key"),
]


class CornerPartCutter(SignPartCutter):
    @staticmethod
    def _alpha(crop: np.ndarray, box: tuple, method: str, backgrounds: np.ndarray) -> np.ndarray:
        if method != "key_sin_amarillo":
            return SignPartCutter._alpha(crop, box, method, backgrounds)
        # The yellow card sits just above this logo; yellow never belongs to the logo, so it is dropped.
        alpha = SignPartCutter._alpha(crop, box, "key", backgrounds)
        yellow = (crop[..., 0] > 200) & (crop[..., 1] > 150) & (crop[..., 2] < 120)
        return np.where(yellow, 0, alpha).astype(np.uint8)

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.output = project_root / OUTPUT
        art = Image.open(project_root / SOURCE).convert("RGB")
        self.scale = BOARD_WIDTH / art.width
        self.source = np.asarray(art.resize((BOARD_WIDTH, round(art.height * self.scale)), Image.LANCZOS))

    def cut_all(self) -> None:
        backgrounds = self._rebuild_backgrounds()
        for band, folder, name, left, top, right, bottom, method in PIECES:
            box = self._board_box(left, top, right, bottom)
            crop = self.source[box[1]:box[3], box[0]:box[2]]
            self._save(folder, name, crop, self._alpha(crop, box, method, backgrounds))
        self._save_bands(backgrounds)
        self._save_card()

    def piece_positions(self) -> list[tuple[str, str, int, int]]:
        return [(name, folder, *self._board_box(left, top, right, bottom)[:2]) for _, folder, name, left, top, right, bottom, _ in PIECES]

    def _rebuild_backgrounds(self) -> np.ndarray:
        backgrounds = self.source.copy()
        columns = np.arange(self.source.shape[1])
        outside_inside = (columns < REBUILT_LEFT) | (columns >= REBUILT_RIGHT)
        for _, start, end in BAND_ROWS:
            top, bottom = self._board_rows(start), self._board_rows(end)
            band = self.source[top:bottom]
            clean = np.median(band[:, SAMPLE_COLUMNS], axis=1)
            distance = np.abs(band.astype(int) - clean[:, None, :].astype(int)).sum(axis=2)
            # The white outside the rounded corners is the sign's shape, not an element.
            corner_white = outside_inside[None, :] & (band.min(axis=2) > 235)
            element = (distance > ELEMENT_DISTANCE) & ~corner_white
            mask = element.astype(np.uint8) * 255
            backgrounds[top:bottom] = cv2.inpaint(np.ascontiguousarray(band), mask, INPAINT_RADIUS, cv2.INPAINT_TELEA)
        return backgrounds

    def _save_bands(self, backgrounds: np.ndarray) -> None:
        (self.output / "fondos").mkdir(parents=True, exist_ok=True)
        for name, start, end in BAND_ROWS:
            band = backgrounds[self._board_rows(start):self._board_rows(end)]
            Image.fromarray(band).save(self.output / "fondos" / f"{name}.webp", lossless=True)

    def card_position(self) -> tuple[int, int]:
        return self._card_placement()[2:]

    def _card_placement(self) -> tuple:
        art = Image.open(self.project_root / CARD_ART).convert("RGBA")
        left, top, right, bottom = art.getchannel("A").getbbox()
        box_left, box_top, box_right, box_bottom = CARD_BOX
        scale = min((box_right - box_left) / (right - left), (box_bottom - box_top) / (bottom - top))
        x = box_left + ((box_right - box_left) - (right - left) * scale) / 2 - left * scale
        y = box_top + ((box_bottom - box_top) - (bottom - top) * scale) / 2 - top * scale
        return art, scale, round(x), round(y)

    def _save_card(self) -> None:
        art, scale, _, _ = self._card_placement()
        card = art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)
        card.save(self.output / "fotos" / "tarjeta_bancolombia.webp", lossless=True)

    def _board_box(self, left: int, top: int, right: int, bottom: int) -> tuple[int, int, int, int]:
        return tuple(self._board_rows(value) for value in (left, top, right, bottom))

    def _board_rows(self, row: int) -> int:
        return round(row * self.scale)


if __name__ == "__main__":
    cutter = CornerPartCutter(PROJECT_ROOT)
    cutter.cut_all()
    for name, folder, x, y in cutter.piece_positions():
        print(name, folder, x, y)
    print("tarjeta_bancolombia", "fotos", *cutter.card_position())
