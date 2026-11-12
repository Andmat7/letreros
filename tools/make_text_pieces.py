"""Draws the plain texts of the Calle 12 sign at print size in Poppins (tools/fonts/, from Google Fonts), with a
dark drop shadow so they read well on the colored bands, as transparent pieces the layout editor places.
Run from the project root: .venv/Scripts/python tools/make_text_pieces.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEXTS = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/textos"
FONTS = PROJECT_ROOT / "tools/fonts"
WHITE = (255, 255, 255, 255)
# The yellow of the Bancolombia texts and the red of the copy shop title, both sampled from the art.
BANCOLOMBIA_YELLOW = (242, 185, 21, 255)
COPY_SHOP_RED = (226, 22, 30, 255)
# Each piece as its width in pixels of the sign at scale 1, an outline color (or None) and its lines as
# (text, relative size, color, Poppins weight). The biggest line fills the width; the others are drawn at their
# share of its letter size.
PIECES = {
    "texto_paga_tus": (1360, None, [("PAGA TUS", 1, WHITE, "ExtraBold"), ("SERVICIOS PÚBLICOS", 1, WHITE, "ExtraBold")]),
    "texto_tipos_servicios": (1000, None, [("Luz • Agua • Gas • Internet", 1, WHITE, "SemiBold")]),
    "texto_recargas_operadores": (520, None, [("RECARGAS", 1, WHITE, "ExtraBold")]),
    "texto_retiros_recargas": (1300, None, [("RETIROS Y RECARGAS", 1, WHITE, "ExtraBold")]),
    # The service is what matters, so it is big; whose agent it is goes small underneath.
    "texto_retiros_consignaciones": (920, None, [
        ("RETIROS Y", 1, BANCOLOMBIA_YELLOW, "ExtraBold"), ("CONSIGNACIONES", 1, BANCOLOMBIA_YELLOW, "ExtraBold"),
        ("Corresponsal Bancolombia", 0.45, WHITE, "SemiBold"),
    ]),
    "texto_fotocopias_titulo": (1240, WHITE, [("FOTOCOPIAS Y DOCUMENTOS", 1, COPY_SHOP_RED, "Black")]),
    "texto_fotocopias_direccion": (1100, None, [("(PRIMER LOCAL A LA IZQUIERDA)", 1, WHITE, "Bold")]),
}
LINE_GAP = 0.2
OUTLINE_SHARE = 0.06
SHADOW = (8, 16, 50, 255)
SHADOW_OFFSET = 9
SHADOW_BLUR = 3
MARGIN = 24


class TextPieceMaker:
    def make_all(self):
        for name, (width, outline, lines) in PIECES.items():
            self._save(self._draw(width, outline, lines), name)

    def _draw(self, width, outline, lines):
        base_size = self._base_size(width, lines)
        fonts = [self._font(weight, round(base_size * share)) for _, share, _, weight in lines]
        stroke = round(base_size * OUTLINE_SHARE) if outline else 0
        boxes = [font.getbbox(text, stroke_width=stroke) for font, (text, *_) in zip(fonts, lines)]
        heights = [bottom - top for _, top, _, bottom in boxes]
        gap = round(max(heights) * LINE_GAP)
        size = (width + 2 * (MARGIN + stroke), sum(heights) + gap * (len(lines) - 1) + 2 * MARGIN + SHADOW_OFFSET)
        letters = Image.new("RGBA", size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(letters)
        top = MARGIN
        for font, (text, _, color, _), (left, box_top, right, _), height in zip(fonts, lines, boxes, heights):
            place = ((size[0] - (right - left)) // 2 - left, top - box_top)
            draw.text(place, text, font=font, fill=color, stroke_width=stroke, stroke_fill=outline)
            top += height + gap
        piece = Image.new("RGBA", size, (0, 0, 0, 0))
        piece.alpha_composite(self._shadow(letters), (SHADOW_OFFSET, SHADOW_OFFSET))
        piece.alpha_composite(letters)
        return piece

    # The letter size at which the widest line, at its share, is exactly as wide as the piece.
    def _base_size(self, width, lines):
        return 100 * width / max(self._font(weight, 100).getlength(text) * share for text, share, _, weight in lines)

    def _font(self, weight, size):
        path = FONTS / f"Poppins-{weight}.ttf"
        if not path.exists():
            raise FileNotFoundError(f"Font not found: {path} (download Poppins from Google Fonts into tools/fonts)")
        return ImageFont.truetype(str(path), size)

    def _shadow(self, letters):
        shadow = Image.new("RGBA", letters.size, SHADOW)
        shadow.putalpha(letters.getchannel("A"))
        return shadow.filter(ImageFilter.GaussianBlur(SHADOW_BLUR))

    def _save(self, piece, name):
        piece.save(TEXTS / f"{name}.webp", lossless=True)
        print(f"{name}: {piece.width}x{piece.height}")


if __name__ == "__main__":
    TextPieceMaker().make_all()
