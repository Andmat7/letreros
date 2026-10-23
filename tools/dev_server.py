"""Serves the project locally without browser caching.

The page loads many ES modules; a cached old module next to a new one breaks imports.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class NoCacheRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class DevServer:
    def __init__(self, project_root: Path, port: int = 8000):
        handler = partial(NoCacheRequestHandler, directory=str(project_root))
        self.server = ThreadingHTTPServer(("localhost", port), handler)

    def serve(self) -> None:
        print(f"Serving on http://localhost:{self.server.server_port}")
        self.server.serve_forever()


if __name__ == "__main__":
    DevServer(PROJECT_ROOT).serve()
