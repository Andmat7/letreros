"""The newest change time of the files a page loads, so open pages can reload themselves when it moves."""
from pathlib import Path

# What each page loads. The editor leaves out the 3D bundle, so saving a sign does not reload the editor itself.
WATCHED = {
    "site": ["index.html", "src"],
    "editor": ["tools/layout_editor", "src/data", "images/signs/partes"],
}


class ProjectVersion:
    def __init__(self, project_root: Path):
        self.project_root = project_root

    def current(self, page: str) -> str:
        if page not in WATCHED:
            raise ValueError(f"Unknown page: {page}")
        newest = 0.0
        for watched in WATCHED[page]:
            path = self.project_root / watched
            files = path.rglob("*") if path.is_dir() else [path]
            newest = max([newest, *(file.stat().st_mtime for file in files if file.is_file())])
        return f"{newest:.3f}"
