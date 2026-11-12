"""Takes the full sign image the layout editor sends and makes it the board's finished layout: saved in
images/signs/propuestas/, shown on the 3D board at http://localhost:8020/ and written as the print PDF.
"""
import io
import threading
from pathlib import Path

from PIL import Image

from build_photo_bundle import PhotoBundleBuilder
from make_print_pdfs import PrintPdfWriter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SIGN_KEYS = {"carrera_7", "calle_12"}
# Every open editor publishes on its own, so saves wait for each other instead of writing the same files at once.
PUBLISH_LOCK = threading.Lock()


class LayoutPublisher:
    def publish(self, sign_key: str, png_bytes: bytes) -> str:
        if sign_key not in SIGN_KEYS:
            raise ValueError(f"Unknown sign: {sign_key}")
        image = Image.open(io.BytesIO(png_bytes)).convert("RGB")
        with PUBLISH_LOCK:
            image.save(PROJECT_ROOT / "images/signs/propuestas" / f"{sign_key}_layout.webp", lossless=True)
            PhotoBundleBuilder(PROJECT_ROOT).build()
            pdf = PrintPdfWriter().write(sign_key)
        return f"impresion/{pdf.name}"
