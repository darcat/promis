#!/usr/bin/env python3

from time import gmtime, strftime
from http.server import BaseHTTPRequestHandler, HTTPServer

class MyServer(BaseHTTPRequestHandler):
  def do_GET(self):
    print("Got a request, serving.")
    self.send_response(200)
    self.send_header("Content-type", "application/json")
    self.end_headers()
    self.wfile.write(bytes(strftime("{ 'time': '%a, %d %b %Y %H:%M:%S +0000' }", gmtime()), "utf8"))
    return 
  
httpd = HTTPServer( ( "0.0.0.0", 8080 ), MyServer)
print("Starting up.")
httpd.serve_forever()
