"""Draws the "PAGA TUS / SERVICIOS PÚBLICOS" title and the "Y TAMBIÉN RECARGAS A" line of the Calle 12 services
section at print size: heavy white letters with a dark blue drop shadow, easy to read on the blue band, as
transparent pieces the layout editor places. Run from the project root:
.venv/Scripts/python tools/make_services_texts.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEXTS = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/textos"
FONT_PATH = Path("C:/Windows/Fonts/ariblk.ttf")
# Each piece as its lines and the width of its widest line, in pixels of the sign at scale 1.
PIECES = {
    "texto_paga_tus": (["PAGA TUS", "SERVICIOS PÚBLICOS"], 1360),
    "texto_recargas_operadores": (["Y TAMBIÉN RECARGAS A"], 1200),
}
LINE_GAP = 0.14
LETTERS = (255, 255, 255, 255)
SHADOW = (8, 24, 70, 255)
SHADOW_OFFSET = 9
SHADOW_BLUR = 3
MARGIN = 24


class ServicesTextMaker:
    def make_all(self):
        if not FONT_PATH.exists():
            raise FileNotFoundError(f"Font not found: {FONT_PATH}")
        for name, (lines, widest_line) in PIECES.items():
            self._make(name, lines, widest_line)

    def _make(self, name, lines, widest_line):
        font = self._font_for_width(lines, widest_line)
        boxes = [font.getbbox(line) for line in lines]
        line_height = max(bottom - top for _, top, _, bottom in boxes)
        gap = round(line_height * LINE_GAP)
        size = (widest_line + 2 * MARGIN, len(lines) * line_height + gap * (len(lines) - 1) + 2 * MARGIN + SHADOW_OFFSET)
        letters = Image.new("RGBA", size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(letters)
        top = MARGIN
        for line, (left, _, right, _) in zip(lines, boxes):
            draw.text(((size[0] - (right - left)) // 2 - left, top - min(box[1] for box in boxes)), line, font=font, fill=LETTERS)
            top += line_height + gap
        title = Image.new("RGBA", size, (0, 0, 0, 0))
        title.alpha_composite(self._shadow(letters), (SHADOW_OFFSET, SHADOW_OFFSET))
        title.alpha_composite(letters)
        title.save(TEXTS / f"{name}.webp", lossless=True)
        print(f"{name}: {title.width}x{title.height}")

    def _font_for_width(self, lines, widest_line):
        sample = ImageFont.truetype(str(FONT_PATH), 100)
        size = round(100 * widest_line / max(sample.getlength(line) for line in lines))
        return ImageFont.truetype(str(FONT_PATH), size)

    def _shadow(self, letters):
        shadow = Image.new("RGBA", letters.size, SHADOW)
        shadow.putalpha(letters.getchannel("A"))
        return shadow.filter(ImageFilter.GaussianBlur(SHADOW_BLUR))


if __name__ == "__main__":
    ServicesTextMaker().make_all()
