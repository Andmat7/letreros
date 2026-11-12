"""Splits the row of carrier logos of the Calle 12 services section (logos/logos_operadores.webp) into one piece per
carrier, trimmed to its logo, so the layout editor can stack them in a grid. Run from the project root:
.venv/Scripts/python tools/split_operator_logos.py
"""
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGOS = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/logos"
SOURCE = LOGOS / "logos_operadores.webp"
# Columns of the row between the logos, from left to right.
CARRIERS = {"logo_claro": (0, 176), "logo_tigo": (176, 371), "logo_movistar": (371, 543), "logo_wom": (543, 722)}
MARGIN = 6


class OperatorLogoSplitter:
    def split_all(self):
        row = Image.open(SOURCE).convert("RGBA")
        for name, (left, right) in CARRIERS.items():
            logo = row.crop((left, 0, right, row.height))
            box = logo.getchannel("A").point(lambda alpha: 255 if alpha > 40 else 0).getbbox()
            if box is None:
                raise ValueError(f"No logo between columns {left} and {right}")
            logo = logo.crop((max(box[0] - MARGIN, 0), max(box[1] - MARGIN, 0), min(box[2] + MARGIN, logo.width), min(box[3] + MARGIN, logo.height)))
            logo.save(LOGOS / f"{name}.webp", lossless=True)
            print(f"{name}: {logo.width}x{logo.height}")


if __name__ == "__main__":
    OperatorLogoSplitter().split_all()
