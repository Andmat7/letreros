"""Draws the plain texts of the Calle 12 sign at print size: heavy letters with a dark drop shadow, easy to read on
the colored bands, as transparent pieces the layout editor places. Run from the project root:
.venv/Scripts/python tools/make_text_pieces.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEXTS = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/textos"
FONT_PATH = Path("C:/Windows/Fonts/ariblk.ttf")
WHITE = (255, 255, 255, 255)
# The yellow of the Bancolombia texts in the art.
BANCOLOMBIA_YELLOW = (242, 185, 21, 255)
# Each piece as its width in pixels of the sign at scale 1 and its lines as (text, relative size, color). The
# biggest line fills the width; the others are drawn at their share of its letter size.
PIECES = {
    "texto_paga_tus": (1360, [("PAGA TUS", 1, WHITE), ("SERVICIOS PÚBLICOS", 1, WHITE)]),
    "texto_recargas_operadores": (560, [("Y TAMBIÉN", 1, WHITE), ("RECARGAS A", 1, WHITE)]),
    "texto_retiros_recargas": (1300, [("RETIROS Y RECARGAS", 1, WHITE)]),
    # The service is what matters, so it is big; whose agent it is goes small underneath.
    "texto_retiros_consignaciones": (920, [
        ("RETIROS Y", 1, BANCOLOMBIA_YELLOW), ("CONSIGNACIONES", 1, BANCOLOMBIA_YELLOW), ("Corresponsal Bancolombia", 0.45, WHITE),
    ]),
}
LINE_GAP = 0.2
SHADOW = (8, 16, 50, 255)
SHADOW_OFFSET = 9
SHADOW_BLUR = 3
MARGIN = 24


class TextPieceMaker:
    def make_all(self):
        if not FONT_PATH.exists():
            raise FileNotFoundError(f"Font not found: {FONT_PATH}")
        for name, (width, lines) in PIECES.items():
            self._save(self._draw(width, lines), name)

    def _draw(self, width, lines):
        base_size = self._base_size(width, lines)
        fonts = [ImageFont.truetype(str(FONT_PATH), round(base_size * share)) for _, share, _ in lines]
        boxes = [font.getbbox(text) for font, (text, _, _) in zip(fonts, lines)]
        heights = [bottom - top for _, top, _, bottom in boxes]
        gap = round(max(heights) * LINE_GAP)
        size = (width + 2 * MARGIN, sum(heights) + gap * (len(lines) - 1) + 2 * MARGIN + SHADOW_OFFSET)
        letters = Image.new("RGBA", size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(letters)
        top = MARGIN
        for font, (text, _, color), (left, box_top, right, _), height in zip(fonts, lines, boxes, heights):
            draw.text(((size[0] - (right - left)) // 2 - left, top - box_top), text, font=font, fill=color)
            top += height + gap
        piece = Image.new("RGBA", size, (0, 0, 0, 0))
        piece.alpha_composite(self._shadow(letters), (SHADOW_OFFSET, SHADOW_OFFSET))
        piece.alpha_composite(letters)
        return piece

    # The letter size at which the widest line, at its share, is exactly as wide as the piece.
    def _base_size(self, width, lines):
        sample = ImageFont.truetype(str(FONT_PATH), 100)
        return 100 * width / max(sample.getlength(text) * share for text, share, _ in lines)

    def _shadow(self, letters):
        shadow = Image.new("RGBA", letters.size, SHADOW)
        shadow.putalpha(letters.getchannel("A"))
        return shadow.filter(ImageFilter.GaussianBlur(SHADOW_BLUR))

    def _save(self, piece, name):
        piece.save(TEXTS / f"{name}.webp", lossless=True)
        print(f"{name}: {piece.width}x{piece.height}")


if __name__ == "__main__":
    TextPieceMaker().make_all()
