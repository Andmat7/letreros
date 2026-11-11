"""Serves the project locally without browser caching, and saves the signs the layout editor publishes.

The page loads many ES modules; a cached old module next to a new one breaks imports.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from layout_publisher import LayoutPublisher

PROJECT_ROOT = Path(__file__).resolve().parent.parent
# A fixed port of its own, so it never clashes with the dev servers of other local projects.
PORT = 8020


class NoCacheRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # The layout editor posts the full sign here (POST /publish_layout?sign=<key>, PNG body).
    def do_POST(self) -> None:
        address = urlparse(self.path)
        if address.path != "/publish_layout":
            return self.send_error(404)
        sign_key = parse_qs(address.query).get("sign", [""])[0]
        body = self.rfile.read(int(self.headers["Content-Length"]))
        try:
            reply, status = LayoutPublisher().publish(sign_key, body), 200
        except ValueError as publish_error:
            reply, status = str(publish_error), 400
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(reply.encode())


class DevServer:
    def __init__(self, project_root: Path, port: int = PORT):
        handler = partial(NoCacheRequestHandler, directory=str(project_root))
        self.server = ThreadingHTTPServer(("localhost", port), handler)

    def serve(self) -> None:
        print(f"Serving on http://localhost:{self.server.server_port}")
        self.server.serve_forever()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    DevServer(PROJECT_ROOT, port).serve()
