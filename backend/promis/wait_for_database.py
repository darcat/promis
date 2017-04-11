#!/usr/bin/env python3
#
# Copyright 2016 Space Research Institute of NASU and SSAU (Ukraine)
#
# Licensed under the EUPL, Version 1.1 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
#
# https://joinup.ec.europa.eu/software/page/eupl
#
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
#

"""Hangs the execution up until the database is up and can run queries"""

# TODO: maybe a better approach, timeouts etc?
# TODO: should this be a django command by the way?

import psycopg2
import dj_database_url
from time import sleep
from os import environ

# Parsing the URL
nametrans = { "NAME": "dbname", "HOST": "host", "PORT": "port", "USER": "user", "PASSWORD": "password" }
dbargs = { nametrans[k]:v for k,v in dj_database_url.config().items() if k in nametrans }

# Try connecting, if it fails, pause by 3 seconds
while True:
    try:
        with psycopg2.connect(**dbargs) as conn:
            with conn.cursor() as curs:
                curs.execute("select * from county;") # POSTGIS thing
                break
        
    except psycopg2.OperationalError:
        print("=> Database not available, retrying in 3 seconds")
        sleep(3)
        
print("=> Database is available and accepting queries, starting PROMIS")
