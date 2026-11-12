"""Draws the "EN LA TIENDA ÉSIKA (SEGUNDO LOCAL A LA IZQUIERDA)" header of
images/signs/propuestas/encabezado_tienda_esika_referencia.png at print resolution, as loose pieces and as one
finished header per board. The column stands at the corner, so its header says "A LA VUELTA" with a turning arrow.
Arrows are drawn as a tip and a body (and a turn), each body centered on the tip. Run from the project root:
.venv/Scripts/python tools/make_store_header_parts.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT = PROJECT_ROOT / "images/signs/partes/encabezado_tienda_esika"
# Poppins from Google Fonts, kept in tools/fonts so the header looks the same on any computer.
FONT_PATH = PROJECT_ROOT / "tools/fonts/Poppins-ExtraBold.ttf"
# The store red from the reference image fills the header and the letters and arrow are white on it.
# The pieces keep their first names (texto_rojo, texto_azul) so layouts saved in the editor still find them.
STORE_RED = (190, 4, 4, 255)
TRANSPARENT = (0, 0, 0, 0)
WHITE = (255, 255, 255, 255)
LETTERING = WHITE
# Header sizes in pixels of each board (3200 px per meter): width, height, side margin.
WIDE_HEADER = (1920, 583, 90)
COLUMN_HEADER = (960, 400, 36)
ARROW_GAP = 0.05
# Joined arrow pieces overlap by this many pixels so no seam shows; the layout editor uses the same value.
BODY_OVERLAP = 3
# Shapes are drawn this many times larger and scaled down, for smooth edges.
SUPERSAMPLE = 4
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
            "texto_rojo": self._fitted_line("EN LA TIENDA ÉSIKA", width, LETTERING),
            "texto_azul": self._fitted_line("(SEGUNDO LOCAL A LA IZQUIERDA)", width, LETTERING),
        }

    # "A LA VUELTA" and "EN LA TIENDA ÉSIKA" go on two lines of the same letter size, with the short direction
    # ("2º local", so it can be bigger) under them;
    # the column is narrow, so the arrow is taller than the lines.
    def _column_text(self):
        width = 600
        size = self._size_for_width("EN LA TIENDA ÉSIKA", width)
        return {
            "texto_rojo": self._line("A LA VUELTA", size, LETTERING),
            "texto_tienda": self._line("EN LA TIENDA ÉSIKA", size, LETTERING),
            "texto_azul": self._fitted_line("(2º LOCAL A LA IZQUIERDA)", round(width * 0.9), LETTERING),
        }

    # The arrow beside the stacked texts, as tall as its share of them, all centered in the header.
    # Each piece is saved at its final size so the layout editor shows it at scale 1.
    def _make_header(self, folder, size, texts, arrow_style):
        width, height, margin = size
        make_arrow, arrow_share = arrow_style
        text = self._stack(list(texts.values()))
        arrow_width, arrow_height = self._bounds(make_arrow(round(text.height * arrow_share)))
        natural_width = arrow_width + width * ARROW_GAP + text.width
        scale = min((width - 2 * margin) / natural_width, (height - 2 * margin) / max(text.height, arrow_height))
        arrow = make_arrow(round(text.height * scale * arrow_share))
        left = round((width - natural_width * scale) / 2)
        text_right, top = width - left, round((height - text.height * scale) / 2)
        arrow_top = (height - self._bounds(arrow)[1]) // 2
        places = {name: (piece, left + x, arrow_top + y) for name, (piece, x, y) in arrow.items()}
        for name, (piece, piece_top) in self._scaled_lines(texts, scale).items():
            places[name] = (piece, text_right - round((text.width * scale + piece.width) / 2), top + piece_top)
        self._save_header(folder, size, places)

    def _bounds(self, pieces):
        return (max(x + piece.width for piece, x, _ in pieces.values()), max(y + piece.height for piece, _, y in pieces.values()))

    # The texts shrunk by scale, with their tops as they stand in the stack.
    def _scaled_lines(self, texts, scale):
        scaled, top = {}, 0
        gap = round(next(iter(texts.values())).height * LINE_GAP)
        for name, piece in texts.items():
            scaled[name] = (piece.resize((round(piece.width * scale), round(piece.height * scale)), Image.LANCZOS), round(top * scale))
            top += piece.height + gap
        return scaled

    # Each board gets its own folder, with the pieces under the names the layout editor shows and the plain red
    # "fondo" the editor uses as the header band.
    def _save_header(self, folder, size, places):
        (OUTPUT / folder).mkdir(parents=True, exist_ok=True)
        header = Image.new("RGBA", size[:2], STORE_RED)
        self._save(header.copy(), f"{folder}/fondo")
        for name, (piece, x, y) in places.items():
            header.alpha_composite(piece, (x, y))
            self._save(piece, f"{folder}/{name}")
            print(f"  at {x}, {y}")
        self._save(header, f"{folder}/encabezado")

    # A left arrow: the triangular tip and a straight body under half as thick, centered on the tip.
    def _straight_arrow(self, height):
        thickness = round(height * 0.46)
        tip = self._polygon((round(height * 0.5), height), [(0, 0.5), (1, 0), (1, 1)])
        body = Image.new("RGBA", (round(height * 0.7), thickness), LETTERING)
        return {"flecha_cuerpo": (body, tip.width - BODY_OVERLAP, (height - thickness) // 2), "flecha_punta": (tip, 0, 0)}

    # The turning arrow: the tip points up, the turn hangs centered under it and the straight body leaves to the right.
    def _curved_arrow(self, height):
        thickness = round(height / 3.6)
        tip = self._polygon((round(thickness * 2.15), round(thickness * 1.4)), [(0.5, 0), (1, 1), (0, 1)])
        turn = self._turn(thickness)
        body = Image.new("RGBA", (round(thickness * 1.6), thickness), LETTERING)
        turn_left, turn_top = (tip.width - thickness) // 2, tip.height - BODY_OVERLAP
        return {
            "flecha_curva": (turn, turn_left, turn_top),
            "flecha_cuerpo": (body, turn_left + turn.width - BODY_OVERLAP, turn_top + turn.height - thickness),
            "flecha_punta": (tip, 0, 0),
        }

    # A short stem going down that bends a quarter turn to the right, as thick as the body.
    def _turn(self, thickness):
        stem, inner = round(thickness * 0.37), round(thickness * 0.75)
        outer = inner + thickness
        canvas = Image.new("RGBA", (outer * SUPERSAMPLE, (stem + outer) * SUPERSAMPLE), TRANSPARENT)
        draw = ImageDraw.Draw(canvas)
        draw.rectangle([0, 0, thickness * SUPERSAMPLE - 1, stem * SUPERSAMPLE], fill=LETTERING)
        for radius, color in ((outer, LETTERING), (inner, TRANSPARENT)):
            center_x, center_y, reach = outer * SUPERSAMPLE, stem * SUPERSAMPLE, radius * SUPERSAMPLE
            draw.pieslice([center_x - reach, center_y - reach, center_x + reach, center_y + reach], 90, 180, fill=color)
        return canvas.resize((outer, stem + outer), Image.LANCZOS)

    # A white polygon whose corners are given as fractions of its size.
    def _polygon(self, size, corners):
        width, height = size
        canvas = Image.new("RGBA", (width * SUPERSAMPLE, height * SUPERSAMPLE), TRANSPARENT)
        ImageDraw.Draw(canvas).polygon([(x * width * SUPERSAMPLE, y * height * SUPERSAMPLE) for x, y in corners], fill=LETTERING)
        return canvas.resize(size, Image.LANCZOS)

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
        return ImageFont.truetype(str(FONT_PATH), size)

    def _save(self, image, name):
        image.save(OUTPUT / f"{name}.webp", lossless=True)
        print(f"{name}: {image.width}x{image.height}")


if __name__ == "__main__":
    StoreHeaderMaker().make_all()
