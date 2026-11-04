"""Cuts the new public services art into the pieces of the Calle 12 sign's services section.

The art is taller than its slot, so its empty top and bottom margins are trimmed, it is scaled to the slot height
and the sides are filled with its own edge color, so nothing is squashed. Faint "Retira" and "Consulta" marks
left in the art are painted out. Texts and logos are keyed against the blue behind them, the invoices are cut out
with GrabCut, and the band is rebuilt without them. The whole band is also pasted on the rendered layout.
"""
from pathlib import Path

import numpy as np
import cv2
from PIL import Image

from cut_sign_parts import SignPartCutter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/servicios_publicos_nueva.webp"
OUTPUT = "images/signs/partes/esquina_calle_12_nueva"
BAND_NAME = "04_servicios_publicos"
RENDERED_LAYOUT = "images/signs/propuestas/esquina_calle_12_layout.webp"
# Where the services section sits on the 1920 x 4480 sign (default section heights of the layout editor).
SLOT_TOP, SLOT_HEIGHT, BOARD_WIDTH = 2263, 1262, 1920
# Rows of the art that hold content, and areas (left, top, right, bottom) with faint marks to paint out.
CONTENT_ROWS = (40, 1745)
FAINT_MARKS = [(240, 1530, 750, 1770), (1735, 1530, 2120, 1770)]
MARK_INPAINT_RADIUS = 25
# Pieces as (folder, name, left, top, right, bottom, how it is cut), in pixels of the art, top to bottom.
PIECES = [
    ("textos", "texto_paga_aqui", 240, 50, 2160, 425, "key"),
    ("textos", "texto_luz_agua_gas", 490, 430, 1900, 575, "key"),
    ("fotos", "facturas_servicios", 80, 560, 2340, 1460, "grabcut"),
    ("textos", "texto_tambien_recargas", 480, 1395, 1900, 1530, "key"),
    ("logos", "logos_operadores", 735, 1515, 1710, 1740, "key"),
]
# Columns of the fitted band at both sides where only the clean blue shows.
EDGE_COLUMNS = [slice(20, 100), slice(1830, 1900)]
ROW_SMOOTHING = 15
BAND_INPAINT_RADIUS = 9


class ServicesPartCutter:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.output = project_root / OUTPUT
        art = np.asarray(Image.open(project_root / SOURCE).convert("RGB"))
        self.cleaned = self._paint_out_marks(art)[CONTENT_ROWS[0]:CONTENT_ROWS[1]]
        self.scale = SLOT_HEIGHT / self.cleaned.shape[0]
        self.left_padding = (BOARD_WIDTH - round(self.cleaned.shape[1] * self.scale)) // 2
        self.band = self._fit_to_slot(self.cleaned)

    def cut_all(self) -> list[tuple[str, str, int, int]]:
        boxes = [self._band_box(*piece[2:6]) for piece in PIECES]
        plain = self._inpaint_boxes(boxes)
        for (folder, name, *_, method), box in zip(PIECES, boxes):
            self._cut_piece(folder, name, box, method, plain)
        self._save_band()
        return [(name, folder, box[0], SLOT_TOP + box[1]) for (folder, name, *_), box in zip(PIECES, boxes)]

    def _cut_piece(self, folder: str, name: str, box: tuple, method: str, plain: np.ndarray) -> None:
        left, top, right, bottom = box
        crop = self.band[top:bottom, left:right]
        SignPartCutter._save(self, folder, name, crop, SignPartCutter._alpha(crop, box, method, plain))

    def _save_band(self) -> None:
        # Painting over the pieces leaves smears across this much art, so the band is rebuilt from the clean
        # blue at both edges of each row instead; that drops the soft glow behind the invoices.
        edges = np.concatenate([self.band[:, column_range] for column_range in EDGE_COLUMNS], axis=1)
        row_colors = cv2.GaussianBlur(np.median(edges, axis=1)[:, None, :], (0, 0), ROW_SMOOTHING)[:, 0].astype(np.uint8)
        clean_band = np.repeat(row_colors[:, None, :], BOARD_WIDTH, axis=1)
        Image.fromarray(clean_band).save(self.output / "fondos" / f"{BAND_NAME}.webp", lossless=True)

    def place_on_layout(self) -> None:
        layout = Image.open(self.project_root / RENDERED_LAYOUT).convert("RGB")
        layout.paste(Image.fromarray(self.band), (0, SLOT_TOP))
        layout.save(self.project_root / RENDERED_LAYOUT, lossless=True)

    def _inpaint_boxes(self, boxes: list) -> np.ndarray:
        # The blue behind every piece, guessed from around its box, is what texts and invoices are cut against.
        mask = np.zeros(self.band.shape[:2], np.uint8)
        for left, top, right, bottom in boxes:
            mask[top:bottom, left:right] = 255
        return cv2.inpaint(self.band, mask, BAND_INPAINT_RADIUS, cv2.INPAINT_TELEA)

    def _band_box(self, left: int, top: int, right: int, bottom: int) -> tuple[int, int, int, int]:
        to_column = lambda column: min(BOARD_WIDTH, self.left_padding + round(column * self.scale))
        to_row = lambda row: min(SLOT_HEIGHT, max(0, round((row - CONTENT_ROWS[0]) * self.scale)))
        return to_column(left), to_row(top), to_column(right), to_row(bottom)

    def _fit_to_slot(self, cleaned: np.ndarray) -> np.ndarray:
        width = round(cleaned.shape[1] * self.scale)
        if width > BOARD_WIDTH:
            raise ValueError(f"The scaled art is {width - BOARD_WIDTH} px wider than the board")
        scaled = cv2.resize(cleaned, (width, SLOT_HEIGHT), interpolation=cv2.INTER_AREA)
        right_padding = BOARD_WIDTH - width - self.left_padding
        return cv2.copyMakeBorder(scaled, 0, 0, self.left_padding, right_padding, cv2.BORDER_REPLICATE)

    @staticmethod
    def _paint_out_marks(art: np.ndarray) -> np.ndarray:
        mask = np.zeros(art.shape[:2], np.uint8)
        for left, top, right, bottom in FAINT_MARKS:
            mask[top:bottom, left:right] = 255
        return cv2.inpaint(np.ascontiguousarray(art), mask, MARK_INPAINT_RADIUS, cv2.INPAINT_TELEA)


if __name__ == "__main__":
    cutter = ServicesPartCutter(PROJECT_ROOT)
    for name, folder, x, y in cutter.cut_all():
        print(name, folder, x, y)
    cutter.place_on_layout()
