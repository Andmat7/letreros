"""Cuts images/signs/propuestas/fotocopiadora_nueva.png (the copy shop art) into the background and pieces of the
Fotocopiadora section of the Calle 12 sign, under a dotted line that separates it from the Corresponsal part, at
the size they have there, so the layout editor shows them at scale 1. Prints where each piece goes. Run from the project root: .venv/Scripts/python tools/cut_fotocopias_parts.py
"""
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE = PROJECT_ROOT / "images/signs/propuestas/fotocopiadora_nueva.png"
OUTPUT = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva"
# The section slot on the sign at the 70 % / 30 % split, in pixels of the sign (3200 px per meter).
SIGN_WIDTH = 1920
SECTION_TOP = 4655
SECTION_HEIGHT = 1745
# The art's dark top band ends at this row; under it the background is a flat light gray.
BAND_BOTTOM = 152
BAND_COLOR = (25, 25, 25)
BACKGROUND_COLOR = (239, 239, 239)
# The strip on top of the section that holds the dotted line: white dots on the art's dark band, which starts there.
SEPARATOR_HEIGHT = 70
SEPARATOR_COLOR = BAND_COLOR
DOT_COLOR = (255, 255, 255)
DOT_LENGTH, DOT_GAP, DOT_THICKNESS = 40, 26, 12
# Boxes in pixels of the art (left, top, right, bottom), with a small margin around each element.
PIECES = {
    "logos/flecha_fotocopias": (20, 40, 126, 104),
    "textos/texto_fotocopias_documentos": (140, 28, 666, 79),
    "textos/texto_primer_local_izquierda": (138, 80, 606, 126),
    "fotos/impresora": (0, 263, 314, 617),
    "fotos/panel_fotocopias": (321, 189, 670, 685),
}


class FotocopiasPartsCutter:
    def cut_all(self):
        art = Image.open(SOURCE).convert("RGB")
        # The whole art fits under the separator strip and is centered across the sign.
        scale = (SECTION_HEIGHT - SEPARATOR_HEIGHT) / art.height
        left = round((SIGN_WIDTH - art.width * scale) / 2)
        self._save(self._background(scale), "fondos/06_fotocopiadora")
        for name, box in PIECES.items():
            piece = art.crop(box)
            piece = piece.resize((round(piece.width * scale), round(piece.height * scale)), Image.LANCZOS)
            self._save(piece, name)
            print(f"  at {left + round(box[0] * scale)}, {SECTION_TOP + SEPARATOR_HEIGHT + round(box[1] * scale)}")

    # Flat colors only, so the editor can stretch it to any section height; the band and the dotted line span the
    # whole sign width.
    def _background(self, scale):
        background = Image.new("RGB", (SIGN_WIDTH, SECTION_HEIGHT), BACKGROUND_COLOR)
        background.paste(SEPARATOR_COLOR, (0, 0, SIGN_WIDTH, SEPARATOR_HEIGHT))
        background.paste(BAND_COLOR, (0, SEPARATOR_HEIGHT, SIGN_WIDTH, SEPARATOR_HEIGHT + round(BAND_BOTTOM * scale)))
        dot_top = (SEPARATOR_HEIGHT - DOT_THICKNESS) // 2
        for dot_left in range(DOT_GAP // 2, SIGN_WIDTH, DOT_LENGTH + DOT_GAP):
            background.paste(DOT_COLOR, (dot_left, dot_top, min(dot_left + DOT_LENGTH, SIGN_WIDTH), dot_top + DOT_THICKNESS))
        return background

    def _save(self, image, name):
        image.save(OUTPUT / f"{name}.webp", quality=95)
        print(f"{name}: {image.width}x{image.height}")


if __name__ == "__main__":
    FotocopiasPartsCutter().cut_all()
