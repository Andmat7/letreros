"""Builds src/generated/photo_bundle.js with resized images embedded as data URIs.

Embedding avoids WebGL cross-origin errors when textures come from separate files.
"""
import base64
import io
import json
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class PhotoBundleBuilder:
    max_side = 1400
    jpeg_quality = 82
    sources = {
        "costado": "images/photos/costado.webp",
        "frente": "images/photos/frente.webp",
        "lado": "images/photos/lado.webp",
        "calle_12_frontal": "images/photos/calle_12_frontal.jpg",
        "calle_12_diagonal": "images/photos/calle_12_diagonal.jpg",
        "esquina_cerca": "images/photos/esquina_cerca.jpg",
        "esquina_calle_12": "images/photos/esquina_calle_12.jpg",
        "esquina_diagonal": "images/photos/esquina_diagonal.jpg",
        "esquina_bancolombia": "images/signs/propuestas/esquina_bancolombia_oscuro.webp",
        "esquina_cuatro_servicios": "images/signs/propuestas/esquina_cuatro_servicios.webp",
        "columna_cuatro_servicios": "images/signs/propuestas/columna_cuatro_servicios.webp",
        "bancolombia_retiros": "images/signs/anteriores/bancolombia_retiros.webp",
        "nequi": "images/signs/anteriores/nequi.png",
        "mano": "images/signs/anteriores/mano.webp",
        "tarjeta": "images/signs/anteriores/tarjeta.webp",
        "logo_nequi": "images/signs/anteriores/logo_nequi.avif",
        "facturas_servicios_publicos": "images/signs/anteriores/facturas_servicios_publicos.avif",
    }
    # PNG keeps the transparent background around the hand.
    transparent_keys = {"mano"}

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.output_path = project_root / "src" / "generated" / "photo_bundle.js"

    def build(self) -> None:
        bundle = {key: self._encode(key, path) for key, path in self.sources.items()}
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        content = "export const photo_bundle = " + json.dumps(bundle) + ";\n"
        self.output_path.write_text(content, encoding="utf-8")
        print(f"Wrote {self.output_path} ({len(content) // 1024} KB)")

    def _encode(self, key: str, relative_path: str) -> dict:
        image = Image.open(self.project_root / relative_path).convert("RGBA")
        image.thumbnail((self.max_side, self.max_side))
        buffer = io.BytesIO()
        if key in self.transparent_keys:
            image.save(buffer, "PNG", optimize=True)
            mime_type = "image/png"
        else:
            self._flatten(image).save(buffer, "JPEG", quality=self.jpeg_quality)
            mime_type = "image/jpeg"
        encoded = base64.b64encode(buffer.getvalue()).decode()
        return {"source": f"data:{mime_type};base64,{encoded}", "width": image.width, "height": image.height}

    @staticmethod
    def _flatten(image: Image.Image) -> Image.Image:
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.getchannel("A"))
        return background


if __name__ == "__main__":
    PhotoBundleBuilder(PROJECT_ROOT).build()
