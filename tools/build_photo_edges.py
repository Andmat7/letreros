"""Builds src/generated/photo_edges.js: the straight edges found in every site photo.

Canny finds the edge pixels and a probabilistic Hough transform joins them into line
segments, listed as [x1, y1, x2, y2] in pixels of the original photo, longest first.
"""
import json
from pathlib import Path

import cv2
import numpy
from PIL import Image

from build_photo_bundle import PROJECT_ROOT, PhotoBundleBuilder


class PhotoEdgeBuilder:
    max_segments = 300
    blur_size = 5
    # Shares of the photo diagonal: shorter lines are noise, smaller gaps are joined.
    min_length_share = 0.04
    max_gap_share = 0.008
    repeat_distance_share = 0.006

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.output_path = project_root / "src" / "generated" / "photo_edges.js"

    def build(self) -> None:
        photos = {key: path for key, path in PhotoBundleBuilder.sources.items() if path.startswith("images/photos/")}
        edges = {key: self.find_edges(self.project_root / path) for key, path in photos.items()}
        content = "export const photo_edges = " + json.dumps(edges) + ";\n"
        self.output_path.write_text(content, encoding="utf-8")
        counts = ", ".join(f"{key} {len(found['segments'])}" for key, found in edges.items())
        print(f"Wrote {self.output_path} ({len(content) // 1024} KB): {counts}")

    def find_edges(self, photo_path: Path) -> dict:
        gray = numpy.array(Image.open(photo_path).convert("L"))
        height, width = gray.shape
        edge_pixels = self._canny(gray)
        diagonal = (width ** 2 + height ** 2) ** 0.5
        lines = cv2.HoughLinesP(edge_pixels, 1, numpy.pi / 180, threshold=60,
                                minLineLength=diagonal * self.min_length_share, maxLineGap=diagonal * self.max_gap_share)
        segments = [] if lines is None else lines.reshape(-1, 4).astype(int).tolist()
        segments.sort(key=lambda segment: -self._length(segment))
        return {"width": width, "height": height, "segments": self._distinct(segments, diagonal)[: self.max_segments]}

    # Letters and graffiti give bundles of nearly identical lines; only the longest of each stays.
    def _distinct(self, segments: list, diagonal: float) -> list:
        kept = []
        for segment in segments:
            if not any(self._repeats(segment, other, diagonal * self.repeat_distance_share) for other in kept):
                kept.append(segment)
        return kept

    def _repeats(self, segment: list, other: list, max_distance: float) -> bool:
        direction = numpy.array(other[2:]) - numpy.array(other[:2])
        length = numpy.linalg.norm(direction)
        unit = direction / length
        offsets = [numpy.array(point) - numpy.array(other[:2]) for point in (segment[:2], segment[2:])]
        distances = [abs(offset[0] * unit[1] - offset[1] * unit[0]) for offset in offsets]
        along = [float(offset @ unit) for offset in offsets]
        overlaps = max(along) > 0 and min(along) < length
        return overlaps and max(distances) < max_distance

    # Thresholds follow the photo's own median brightness, so dark and bright photos both work.
    def _canny(self, gray: numpy.ndarray) -> numpy.ndarray:
        blurred = cv2.GaussianBlur(gray, (self.blur_size, self.blur_size), 0)
        median = float(numpy.median(blurred))
        return cv2.Canny(blurred, int(max(0, 0.66 * median)), int(min(255, 1.33 * median)))

    @staticmethod
    def _length(segment: list) -> float:
        x1, y1, x2, y2 = segment
        return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5


if __name__ == "__main__":
    PhotoEdgeBuilder(PROJECT_ROOT).build()
