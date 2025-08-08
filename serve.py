#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from urllib.parse import unquote

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Serve index.html for all routes (React Router)
        if not os.path.exists(self.path[1:]) and not self.path.startswith('/static'):
            self.path = '/index.html'
        return super().do_GET()

os.chdir('build')

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"🚀 Servidor funcionando en http://localhost:{PORT}")
    print(f"🚀 También disponible en http://127.0.0.1:{PORT}")
    print(f"🚀 Presiona Ctrl+C para detener")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")
        httpd.shutdown()