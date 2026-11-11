"""Draws the pieces of the new section at the bottom of the Calle 12 corner sign: the photocopy text,
the arrow and its "en el primer local" text. Run from the project root: .venv/Scripts/python tools/make_new_section_parts.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PARTS_FOLDER = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva"
ARROW_SOURCE = PARTS_FOLDER / "logos/flecha_izquierda.webp"
FONT_PATH = Path("C:/Windows/Fonts/arialbd.ttf")
SIGN_RED = (230, 0, 18, 255)
TRANSPARENT = (0, 0, 0, 0)
TEXT_WIDTH = 1600
ARROW_TEXT_WIDTH = 900
LINE_GAP = 50


class NewSectionPartMaker:
    def make_all(self):
        if not FONT_PATH.exists():
            raise FileNotFoundError(f"Font not found: {FONT_PATH}")
        self._save(self._stacked_lines(["FOTOCOPIAS", "Y HACER DOCUMENTOS"], sized_by=["FOTOCOPIAS", "Y HACER DOCUMENTOS"], width=TEXT_WIDTH), "textos/texto_fotocopias.webp")
        self._save(self._stacked_lines(["EN EL", "PRIMER LOCAL"], sized_by=["PRIMER LOCAL"] * 2, width=ARROW_TEXT_WIDTH), "textos/texto_en_el_primer_local.webp")
        self._save(Image.open(ARROW_SOURCE), "logos/flecha_primer_local.webp")

    # Each line is as large as its sized_by text would be at the full width, so lines can share one size.
    def _stacked_lines(self, lines, sized_by, width):
        rendered = [self._line_image(line, self._font_size_for_width(reference, width)) for line, reference in zip(lines, sized_by)]
        height = sum(line.height for line in rendered) + LINE_GAP * (len(rendered) - 1)
        canvas = Image.new("RGBA", (max(line.width for line in rendered), height), TRANSPARENT)
        top = 0
        for line in rendered:
            canvas.alpha_composite(line, (0, top))
            top += line.height + LINE_GAP
        return canvas

    def _font_size_for_width(self, text, width):
        probe = ImageFont.truetype(str(FONT_PATH), 200)
        left, _, right, _ = probe.getbbox(text)
        return round(200 * width / (right - left))

    def _line_image(self, text, font_size):
        font = ImageFont.truetype(str(FONT_PATH), font_size)
        left, top, right, bottom = font.getbbox(text)
        line = Image.new("RGBA", (right - left, bottom - top), TRANSPARENT)
        ImageDraw.Draw(line).text((-left, -top), text, font=font, fill=SIGN_RED)
        return line

    def _save(self, image, relative_path):
        image.save(PARTS_FOLDER / relative_path, lossless=True)


if __name__ == "__main__":
    NewSectionPartMaker().make_all()
