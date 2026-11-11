"""Takes the full sign image the layout editor sends and makes it the board's finished layout: saved in
images/signs/propuestas/, shown on the 3D board at http://localhost:8000/ and written as the print PDF.
"""
import io
from pathlib import Path

from PIL import Image

from build_photo_bundle import PhotoBundleBuilder
from make_print_pdfs import PrintPdfWriter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SIGN_KEYS = {"columna_esquina", "esquina_calle_12"}


class LayoutPublisher:
    def publish(self, sign_key: str, png_bytes: bytes) -> str:
        if sign_key not in SIGN_KEYS:
            raise ValueError(f"Unknown sign: {sign_key}")
        image = Image.open(io.BytesIO(png_bytes)).convert("RGB")
        image.save(PROJECT_ROOT / "images/signs/propuestas" / f"{sign_key}_layout.webp", lossless=True)
        PhotoBundleBuilder(PROJECT_ROOT).build()
        pdf = PrintPdfWriter().write(sign_key)
        return f"impresion/{pdf.name}"
