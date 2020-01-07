#!/usr/bin/env python3.7

import http.server
import os
import re
from pathlib import Path
import sys

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_my_headers()
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    def do_GET(self):
        path, query = re.match(r'([^?]+)(\?.*)?', self.path).groups()

        # If they're fetching the root, then run `make` first.
        if path == '/':
            os.system('make')

        return super().do_GET()


if __name__ == '__main__':
    # I'm "whatever/kasuba/bin/server.py", and I want to cd to
    # "whatever/kasuba".  That is, unless an argument was passed specifying
    # from where to serve files.
    if len(sys.argv) > 1:
        os.chdir(sys.argv[1])
    else:
        repo = Path(sys.argv[0]).resolve().parent.parent
        os.chdir(repo)

    http.server.test(HandlerClass=MyHTTPRequestHandler)