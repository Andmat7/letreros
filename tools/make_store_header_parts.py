"""Draws the "EN LA TIENDA ÉSIKA (SEGUNDO LOCAL A LA IZQUIERDA)" header of
images/signs/propuestas/encabezado_tienda_esika_referencia.png at print resolution, as loose pieces and as one
finished header per board. The column stands at the corner, so its header says "A LA VUELTA" and keeps the
curved arrow of the earlier art. Run from the project root:
.venv/Scripts/python tools/make_store_header_parts.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = PROJECT_ROOT / "images/signs/partes/encabezado_tienda_esika"
FONT_PATH = Path("C:/Windows/Fonts/bahnschrift.ttf")
FONT_STYLE = b"Bold Condensed"
CURVED_ARROW_SOURCE = PROJECT_ROOT / "images/signs/propuestas/flecha_esika_vuelta_nueva.webp"
CURVED_ARROW_BOX = (84, 37, 812, 640)
# Pixels this far from white count as ink; the ramp keeps the arrow edge smooth.
INK_FLOOR = 12
INK_STRENGTH = 4
# Colors sampled from the reference image.
STORE_RED = (190, 4, 4, 255)
DIRECTION_BLUE = (4, 30, 78, 255)
TRANSPARENT = (0, 0, 0, 0)
WHITE = (255, 255, 255, 255)
# Header sizes in pixels of each board (3200 px per meter): width, height, side margin.
WIDE_HEADER = (1920, 583, 90)
COLUMN_HEADER = (960, 400, 36)
ARROW_GAP = 0.05
BODY_OVERLAP = 3
LINE_GAP = 0.12


class StoreHeaderMaker:
    def make_all(self):
        if not FONT_PATH.exists():
            raise FileNotFoundError(f"Font not found: {FONT_PATH}")
        self._make_header("ancho", WIDE_HEADER, self._wide_text(), (self._straight_arrow, 1.0))
        self._make_header("columna", COLUMN_HEADER, self._column_text(), (self._curved_arrow, 1.5))

    # Both lines span the same width, as in the reference image.
    def _wide_text(self):
        width = 1600
        return {
            "texto_rojo": self._fitted_line("EN LA TIENDA ÉSIKA", width, STORE_RED),
            "texto_azul": self._fitted_line("(SEGUNDO LOCAL A LA IZQUIERDA)", width, DIRECTION_BLUE),
        }

    # One line per sentence here too; the column is narrow, so the arrow is taller than the two lines.
    def _column_text(self):
        width = 600
        return {
            "texto_rojo": self._fitted_line("A LA VUELTA EN LA TIENDA ÉSIKA", width, STORE_RED),
            "texto_azul": self._fitted_line("(SEGUNDO LOCAL A LA IZQUIERDA)", width, DIRECTION_BLUE),
        }

    # The arrow beside the stacked texts, as tall as its share of them, all centered in the header.
    # Each text is its own piece, saved at its final size so the layout editor shows it at scale 1.
    def _make_header(self, folder, size, texts, arrow_style):
        width, height, margin = size
        make_arrow, arrow_share = arrow_style
        text = self._stack(list(texts.values()))
        arrow_height = round(text.height * arrow_share)
        natural_width = make_arrow(arrow_height).width + width * ARROW_GAP + text.width
        scale = min((width - 2 * margin) / natural_width, (height - 2 * margin) / max(text.height, arrow_height))
        arrow = make_arrow(round(text.height * scale * arrow_share))
        left = round((width - natural_width * scale) / 2)
        text_right, top = width - left, round((height - text.height * scale) / 2)
        places = self._arrow_parts(arrow, left, (height - arrow.height) // 2)
        for name, (piece, piece_top) in self._scaled_lines(texts, scale).items():
            places[name] = (piece, text_right - round((text.width * scale + piece.width) / 2), top + piece_top)
        self._save_header(folder, size, places)

    # The arrow as its tip and its straight body, so the editor can lengthen the body without bending the tip.
    # The body overlaps the tip by a few pixels so no seam shows between them.
    def _arrow_parts(self, arrow, left, top):
        split = self._body_start(arrow)
        tip = arrow.crop((0, 0, split + BODY_OVERLAP, arrow.height))
        body = arrow.crop((split, 0, arrow.width, arrow.height))
        return {"flecha_cuerpo": (body, left + split, top), "flecha_punta": (tip, left, top)}

    # The first column from which every column looks like one near the end: where the straight body begins.
    # The reference stays a few pixels inside the right edge, whose soft border differs from the body.
    def _body_start(self, arrow):
        alpha = np.asarray(arrow.getchannel("A")).astype(int)
        reference = arrow.width - 6
        matches = np.abs(alpha - alpha[:, reference:reference + 1]).max(axis=0) < 40
        split = reference
        while split > 0 and matches[split - 1]:
            split -= 1
        return split

    # The texts shrunk by scale, with their tops as they stand in the stack.
    def _scaled_lines(self, texts, scale):
        scaled, top = {}, 0
        gap = round(next(iter(texts.values())).height * LINE_GAP)
        for name, piece in texts.items():
            scaled[name] = (piece.resize((round(piece.width * scale), round(piece.height * scale)), Image.LANCZOS), round(top * scale))
            top += piece.height + gap
        return scaled

    # Each board gets its own folder, with the pieces under the names the layout editor shows.
    def _save_header(self, folder, size, places):
        (OUTPUT / folder).mkdir(parents=True, exist_ok=True)
        header = Image.new("RGBA", size[:2], WHITE)
        for name, (piece, x, y) in places.items():
            header.alpha_composite(piece, (x, y))
            self._save(piece, f"{folder}/{name}")
            print(f"  at {x}, {y}")
        self._save(header, f"{folder}/encabezado")

    # A left arrow: a triangular head and a shaft half its height, drawn 4x larger and scaled down for smooth edges.
    def _straight_arrow(self, height):
        scale = 4
        width = round(height * 1.2)
        big_width, big_height = width * scale, height * scale
        head_length = big_height * 0.5
        shaft_top, shaft_bottom = big_height * 0.27, big_height * 0.73
        canvas = Image.new("RGBA", (big_width, big_height), TRANSPARENT)
        ImageDraw.Draw(canvas).polygon([
            (0, big_height / 2), (head_length, 0), (head_length, shaft_top), (big_width, shaft_top),
            (big_width, shaft_bottom), (head_length, shaft_bottom), (head_length, big_height),
        ], fill=STORE_RED)
        return canvas.resize((width, height), Image.LANCZOS)

    # The turning arrow of the earlier art, keyed out of its white background and painted in the header red.
    def _curved_arrow(self, height):
        source = Image.open(CURVED_ARROW_SOURCE).convert("L").crop(CURVED_ARROW_BOX)
        source = source.resize((round(source.width * height / source.height), height), Image.LANCZOS)
        alpha = source.point(lambda value: max(0, min(255, (255 - value - INK_FLOOR) * INK_STRENGTH)))
        arrow = Image.new("RGBA", source.size, STORE_RED)
        arrow.putalpha(alpha)
        return arrow

    def _stack(self, lines):
        gap = round(lines[0].height * LINE_GAP)
        canvas = Image.new("RGBA", (max(line.width for line in lines), sum(line.height for line in lines) + gap * (len(lines) - 1)), TRANSPARENT)
        top = 0
        for line in lines:
            canvas.alpha_composite(line, ((canvas.width - line.width) // 2, top))
            top += line.height + gap
        return canvas

    def _fitted_line(self, text, width, color):
        return self._line(text, self._size_for_width(text, width), color)

    def _size_for_width(self, text, width):
        left, _, right, _ = self._font(200).getbbox(text)
        return round(200 * width / (right - left))

    def _line(self, text, font_size, color):
        font = self._font(font_size)
        left, top, right, bottom = font.getbbox(text)
        line = Image.new("RGBA", (right - left, bottom - top), TRANSPARENT)
        ImageDraw.Draw(line).text((-left, -top), text, font=font, fill=color)
        return line

    def _font(self, size):
        font = ImageFont.truetype(str(FONT_PATH), size)
        font.set_variation_by_name(FONT_STYLE)
        return font

    def _save(self, image, name):
        image.save(OUTPUT / f"{name}.webp", lossless=True)
        print(f"{name}: {image.width}x{image.height}")


if __name__ == "__main__":
    StoreHeaderMaker().make_all()
