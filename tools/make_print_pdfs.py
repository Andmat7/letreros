"""Writes one print PDF per corner sign, with the full-resolution image stored losslessly.

Pillow would re-encode an RGB image as JPEG inside a PDF, so the PDF is written by hand
with a Flate (zlib) stream, which keeps every pixel.
"""
import zlib
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
# Both layout editors draw the boards at 3200 px per meter, so the pixels give the printed size.
PIXELS_PER_CENTIMETER = 32
POINTS_PER_CENTIMETER = 72 / 2.54
SIGN_KEYS = ["carrera_7", "calle_12"]


class PrintPdfWriter:
    def write_all(self) -> None:
        for sign_key in SIGN_KEYS:
            self.write(sign_key)

    # Writes impresion/<sign>_<width>x<height>_cm.pdf from the finished layout, replacing older sizes of it.
    def write(self, sign_key: str) -> Path:
        image = self._load_flattened(PROJECT_ROOT / "images/signs/propuestas" / f"{sign_key}_layout.webp")
        width_cm, height_cm = (round(side / PIXELS_PER_CENTIMETER) for side in image.size)
        target = PROJECT_ROOT / "impresion" / f"{sign_key}_{width_cm}x{height_cm}_cm.pdf"
        # Built beside the target and swapped in, so the PDF is never missing or half written.
        partial = target.with_suffix(".partial")
        partial.write_bytes(self._build_pdf(image, width_cm * POINTS_PER_CENTIMETER, height_cm * POINTS_PER_CENTIMETER))
        partial.replace(target)
        for old_pdf in (PROJECT_ROOT / "impresion").glob(f"{sign_key}_*x*_cm.pdf"):
            if old_pdf != target:
                old_pdf.unlink()
        print(f"{target.name}: {image.width}x{image.height} px, {target.stat().st_size / 1e6:.1f} MB")
        return target

    def _load_flattened(self, path: Path) -> Image.Image:
        image = Image.open(path).convert("RGBA")
        board = Image.new("RGB", image.size, "white")
        board.paste(image, mask=image.getchannel("A"))
        return board

    def _build_pdf(self, image: Image.Image, page_width: float, page_height: float) -> bytes:
        pixels = zlib.compress(image.tobytes(), 9)
        content = f"q {page_width:.2f} 0 0 {page_height:.2f} 0 0 cm /Image Do Q".encode()
        objects = [
            b"<< /Type /Catalog /Pages 2 0 R >>",
            b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page_width:.2f} {page_height:.2f}] "
            f"/Resources << /XObject << /Image 5 0 R >> >> /Contents 4 0 R >>".encode(),
            self._stream(b"", content),
            self._stream(
                f"/Type /XObject /Subtype /Image /Width {image.width} /Height {image.height} "
                f"/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode".encode(),
                pixels,
            ),
        ]
        return self._assemble(objects)

    def _stream(self, entries: bytes, data: bytes) -> bytes:
        return b"<< " + entries + f" /Length {len(data)} >>\nstream\n".encode() + data + b"\nendstream"

    def _assemble(self, objects: list[bytes]) -> bytes:
        document = bytearray(b"%PDF-1.4\n")
        offsets = []
        for number, body in enumerate(objects, start=1):
            offsets.append(len(document))
            document += f"{number} 0 obj\n".encode() + body + b"\nendobj\n"
        table_start = len(document)
        document += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode()
        document += b"".join(f"{offset:010d} 00000 n \n".encode() for offset in offsets)
        document += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{table_start}\n%%EOF\n".encode()
        return bytes(document)


if __name__ == "__main__":
    PrintPdfWriter().write_all()
