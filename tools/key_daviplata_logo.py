"""Takes the red background out of the cut DaviPlata logo (logos/logo_daviplata.webp of the Calle 12 sign), so it
sits on the plain Davivienda band without a box around it: the app icon stays whole and the white letters and
sparks keep their soft edges. Run from the project root: .venv/Scripts/python tools/key_daviplata_logo.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOGOS = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/logos"
SOURCE = LOGOS / "logo_daviplata.webp"
TARGET = LOGOS / "logo_daviplata_sin_fondo.webp"
# The rounded app icon, in pixels of the logo (left, top, right, bottom) and its corner radius.
ICON_BOX = (132, 24, 432, 310)
ICON_RADIUS = 46
# Green and blue of the background red stay under this; the white letters are far above it.
WHITE_FROM, WHITE_SPAN = 60, 120


class DaviplataLogoKeyer:
    def key(self):
        logo = Image.open(SOURCE).convert("RGB")
        pixels = np.asarray(logo).astype(float)
        whiteness = np.clip((np.minimum(pixels[..., 1], pixels[..., 2]) - WHITE_FROM) / WHITE_SPAN, 0, 1)
        icon = Image.new("L", logo.size, 0)
        ImageDraw.Draw(icon).rounded_rectangle(ICON_BOX, ICON_RADIUS, fill=255)
        alpha = np.maximum(whiteness * 255, np.asarray(icon)).astype(np.uint8)
        keyed = logo.convert("RGBA")
        keyed.putalpha(Image.fromarray(alpha, "L"))
        keyed.save(TARGET, lossless=True)
        print(f"{TARGET.name}: {keyed.width}x{keyed.height}")


if __name__ == "__main__":
    DaviplataLogoKeyer().key()
