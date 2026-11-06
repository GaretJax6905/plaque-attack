"""Serve the game folder over HTTP so Chromium can load its ES modules."""

# pytest injects fixtures by name.
# pylint: disable=redefined-outer-name

import functools
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(SimpleHTTPRequestHandler):
    """Static file handler that doesn't print every request."""

    def log_message(self, *_args):  # pylint: disable=arguments-differ
        return


@pytest.fixture(scope="session")
def site():
    """Base URL of a local static server for the whole repository."""
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_address[1]}"
    server.shutdown()


@pytest.fixture
def js(page, site):
    """Run JavaScript (with access to the game's modules) and return the result."""
    page.goto(f"{site}/tests/harness.html")

    def run(source):
        return page.evaluate(f"async () => {{ {source} }}")

    return run


@pytest.fixture
def errors(page):
    """Collect uncaught page errors; tests assert this stays empty."""
    found = []
    page.on("pageerror", lambda exc: found.append(str(exc)))
    return found
