"""Appends ?v=<content hash> to every local module import and to index.html's script.

GitHub Pages lets browsers cache files for 10 minutes; a new URL per version skips that cache.
Run it before each commit; running it twice changes nothing.
"""
import hashlib
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOCAL_REFERENCE = re.compile(r"""((?:from\s+|import\s+|src=)['"](?:\.{1,2}/|src/)[^'"]*?\.js)(?:\?v=\w+)?(['"])""")


class VersionStamper:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.files = [project_root / "index.html", *sorted((project_root / "src").rglob("*.js"))]

    def run(self) -> str:
        version = self._content_hash()
        for file in self.files:
            self._stamp(file, version)
        return version

    def _content_hash(self) -> str:
        digest = hashlib.sha1()
        for file in self.files:
            digest.update(self._unstamped_text(file).encode())
        return digest.hexdigest()[:10]

    def _unstamped_text(self, file: Path) -> str:
        return LOCAL_REFERENCE.sub(r"\1\2", file.read_text(encoding="utf-8"))

    def _stamp(self, file: Path, version: str) -> None:
        stamped = LOCAL_REFERENCE.sub(rf"\1?v={version}\2", self._unstamped_text(file))
        if stamped != file.read_text(encoding="utf-8"):
            file.write_text(stamped, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    print(f"Stamped version {VersionStamper(PROJECT_ROOT).run()}")
