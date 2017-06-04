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

import ftp_helper, parsers, unix_time
from django.contrib.gis.geos import LineString
import backend_api.models as model
from classes.base_project import BaseProject
import json

# TODO: yield/with problem, see potential.py for details
# TODO: make deploy figure out Docker's bridge IP dynamically

def general_fetch(path, satellite_object):
    with ftp_helper.FTPChecker(path, "172.17.0.1", 2121) as ftp:
        # Iterating over all the sessions available
        for sess_name in ftp.nlst():
            timemark = int(sess_name)
            ftp.cwd(sess_name)
            with ftp.xopen("orbit.csv") as fp:
                line_gen = [ pt for pt in parsers.csv(fp) ]
                time_start = unix_time.maketime(timemark)
                time_end = unix_time.maketime(timemark + len(line_gen)) # Orbit points are 1 per second
                time_dur = time_end - time_start
                # TODO: maybe let the caller print these diagnostics?
                print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)) )
                # TODO: srid should be 4979 see #222
                sess_obj = model.Session.objects.create(time_begin = time_start, time_end = time_end, geo_line = LineString(*line_gen, srid = 4326), space_project = satellite_object )

            # Fetching JSON documents from the FTP
            docs = []
            for fname in [ "channel", "parameter" ]:
                with ftp.xopen(fname + ".json") as fp:
                    docs.append(model.Document.objects.create(json_data = json.loads(fp.getvalue())) )

            # Locating channels/parameters
            # TODO: natural keys
            # TODO: both use same things for now
            chan_obj    = model.Channel.objects.language('en').filter(description = "Termometer reading (%d)" % satellite_object.id)[0]
            par_obj     = model.Parameter.objects.language('en').filter(name = "Measured Space Temperature (%d)" % satellite_object.id)[0]

            # Creating the measurement object
            # TODO: frequencies?
            model.Measurement.objects.create(session = sess_obj, parameter = par_obj, channel = chan_obj, channel_doc = docs[0], parameter_doc = docs[1], sampling_frequency = 1, max_frequency = 1, min_frequency = 1)

            ftp.cwd("..")


class Roundabout(BaseProject):
    '''
    [en]: Test set FTP data collection service (roundabout)
    [uk]: Сервіс забору тестових даних з FTP (roundabout)
    '''
    def check(self):
        with ftp_helper.FTPChecker("roundabout/", "172.17.0.1", 2121) as ftp:
            for v in ftp.check():
                yield v

    def fetch(self, data_id):
        general_fetch("roundabout/" + data_id, self.project_obj)


class PeaceLove(BaseProject):
    '''
    [en]: Test set FTP data collection service (peace & love)
    [uk]: Сервіс забору тестових даних з FTP (peace & love)
    '''
    def check(self):
        with ftp_helper.FTPChecker("peace_love/", "172.17.0.1", 2121) as ftp:
            for v in ftp.check():
                yield v

    def fetch(self, data_id):
        general_fetch("peace_love/" + data_id, self.project_obj)
