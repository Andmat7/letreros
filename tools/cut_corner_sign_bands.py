"""Cuts the Calle 12 corner proposal into the bands the layout editor moves, one band per section.

The proposal is scaled to the 0.60 m board, which is 1920 px wide at the same scale as the column sign.
Each band keeps its own rows of the proposal, so the editor can stretch or move it on its own.
"""
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = "images/signs/propuestas/esquina_calle_12_nueva_0x6_1x4.webp"
OUTPUT = "images/signs/partes/esquina_calle_12_nueva"
BOARD_WIDTH = 1920
# Rows of the proposal where each band starts and ends.
BAND_ROWS = [
    ("01_cabecera", 0, 204),
    ("02_nequi", 204, 532),
    ("03_bancolombia", 532, 791),
    ("04_servicios", 791, 1235),
    ("05_davivienda", 1235, 1568),
]


class CornerBandCutter:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.source = Image.open(project_root / SOURCE).convert("RGB")
        self.scale = BOARD_WIDTH / self.source.width

    def cut_all(self) -> None:
        output = self.project_root / OUTPUT
        output.mkdir(parents=True, exist_ok=True)
        for name, start, end in BAND_ROWS:
            top, bottom = self._board_rows(start), self._board_rows(end)
            band = self.source.crop((0, start, self.source.width, end)).resize((BOARD_WIDTH, bottom - top), Image.LANCZOS)
            band.save(output / f"{name}.webp", lossless=True)

    def _board_rows(self, row: int) -> int:
        return round(row * self.scale)


if __name__ == "__main__":
    cutter = CornerBandCutter(PROJECT_ROOT)
    cutter.cut_all()
    for name, start, _ in BAND_ROWS:
        print(name, cutter._board_rows(start))
