#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer
import psycopg2, os
conn = None

class MyServer(BaseHTTPRequestHandler):
  def do_GET(self):
    print("Got a request, serving.")
    self.send_response(200)
    self.send_header("Content-type", "application/json")
    self.send_header("Access-Control-Allow-Origin", "*")
    self.end_headers()
    result = None
    try:
      cur = conn.cursor()
      cur.execute("""select (now());""")
      result = cur.fetchall()[0][0]
      print("Query succeeded")
    except:
      result = "PGSQL failed."
      print("[ERROR] Query failed")
    self.wfile.write(bytes('{ "time": "%s" }' % str(result), "utf8"))
    return 
  
httpd = HTTPServer( ( "0.0.0.0", 80 ), MyServer)
try:
  print("Starting up.")
  # todo pass param
  conn = psycopg2.connect("dbname = '%s' user='%s' password='%s' host='%s' port='%s'" % 
    (os.environ["POSTGRES_DB"], os.environ["POSTGRES_USER"], os.environ["POSTGRES_PASSWORD"],
     os.environ["POSTGRES_HOST"], os.environ["POSTGRES_PORT"]))
  httpd.serve_forever()
except psycopg2.Error as e:
  print("[ERROR] Failed to connect to the database: %s code %s" % (e.pgerror, e.pgcode))
