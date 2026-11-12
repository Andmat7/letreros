"""Draws the services panel of the copy shop section of the Calle 12 sign in Poppins: a blue rounded panel with a
green check before each service, as in the art but without the laptop. Run from the project root:
.venv/Scripts/python tools/make_copy_shop_panel.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TARGET = PROJECT_ROOT / "images/signs/partes/esquina_calle_12_nueva/fotos/panel_servicios_fotocopias.webp"
FONT_PATH = PROJECT_ROOT / "tools/fonts/Poppins-SemiBold.ttf"
SERVICES = ["Fotocopias B/N", "Impresión de documentos", "Escaneo y envío por correo", "Redacción y edición de documentos"]
# Sizes in pixels of the sign at scale 1; colors sampled from the art.
WIDTH = 880
PADDING = 64
CORNER_RADIUS = 56
FONT_SIZE = 62
LINE_GAP = 0.18
ITEM_GAP = 54
CHECK_SIZE = 74
CHECK_GAP = 34
PANEL_BLUE = (0, 50, 122, 255)
CHECK_GREEN = (125, 191, 26, 255)
WHITE = (255, 255, 255, 255)
SUPERSAMPLE = 3


class CopyShopPanelMaker:
    def make(self):
        if not FONT_PATH.exists():
            raise FileNotFoundError(f"Font not found: {FONT_PATH}")
        font = ImageFont.truetype(str(FONT_PATH), FONT_SIZE * SUPERSAMPLE)
        text_width = (WIDTH - 2 * PADDING - CHECK_SIZE - CHECK_GAP) * SUPERSAMPLE
        items = [self._wrap(service, font, text_width) for service in SERVICES]
        line_height = round(FONT_SIZE * (1 + LINE_GAP)) * SUPERSAMPLE
        height = 2 * PADDING * SUPERSAMPLE + sum(len(lines) * line_height for lines in items) + ITEM_GAP * SUPERSAMPLE * (len(items) - 1)
        panel = Image.new("RGBA", (WIDTH * SUPERSAMPLE, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(panel)
        draw.rounded_rectangle((0, 0, panel.width - 1, height - 1), CORNER_RADIUS * SUPERSAMPLE, fill=PANEL_BLUE)
        top = PADDING * SUPERSAMPLE
        for lines in items:
            self._draw_check(draw, PADDING * SUPERSAMPLE, top + (line_height - CHECK_SIZE * SUPERSAMPLE) // 2)
            for line in lines:
                draw.text(((PADDING + CHECK_SIZE + CHECK_GAP) * SUPERSAMPLE, top + line_height // 2), line, font=font, fill=WHITE, anchor="lm")
                top += line_height
            top += ITEM_GAP * SUPERSAMPLE
        panel = panel.resize((WIDTH, round(height / SUPERSAMPLE)), Image.LANCZOS)
        panel.save(TARGET, lossless=True)
        print(f"{TARGET.name}: {panel.width}x{panel.height}")

    # Words go on one line while they fit; a long service takes two.
    def _wrap(self, text, font, width):
        lines = [""]
        for word in text.split():
            candidate = f"{lines[-1]} {word}".strip()
            if font.getlength(candidate) <= width or not lines[-1]:
                lines[-1] = candidate
            else:
                lines.append(word)
        return lines

    def _draw_check(self, draw, left, top):
        size = CHECK_SIZE * SUPERSAMPLE
        draw.ellipse((left, top, left + size, top + size), fill=CHECK_GREEN)
        points = [(0.27, 0.52), (0.44, 0.69), (0.75, 0.35)]
        draw.line([(left + x * size, top + y * size) for x, y in points], fill=WHITE, width=round(size * 0.12), joint="curve")


if __name__ == "__main__":
    CopyShopPanelMaker().make()
