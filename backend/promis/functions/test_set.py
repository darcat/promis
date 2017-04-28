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

import util.ftp, util.parsers, util.orbit
from django.contrib.gis.geos import LineString
import backend_api.models as model

# TODO: yield/with problem, see potential.py for details
# TODO: make deploy figure out Docker's bridge IP dynamically

def general_fetch(path, satellite_object, add_measurement=False):
    with util.ftp.FTPChecker(path, "172.17.0.1", 2121) as ftp:
        # Iterating over all the sessions available
        for sess_name in ftp.nlst():
            timemark = int(sess_name)
            ftp.cwd(sess_name)
            with ftp.xopen("orbit.csv") as fp:
                line_gen = [ pt for pt in util.parsers.csv(fp) ]
                time_start = util.orbit.maketime(timemark)
                time_end = util.orbit.maketime(timemark + len(line_gen)) # Orbit points are 1 per second
                time_dur = time_end - time_start
                # TODO: maybe let the caller print these diagnostics?
                print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)) )

                sess_obj = model.Session.objects.create(time_begin = time_start, time_end = time_end, geo_line = LineString(*line_gen, srid = 4979), space_project = satellite_object )

            if add_measurement:
                # Fetching JSON documents from the FTP
                docs = []
                for fname in [ "channel", "parameter" ]:
                    with ftp.xopen(fname + ".json") as fp:
                        docs.append(model.Document.objects.create(json_data = fp.getvalue()) )

                # Locating channels/parameters
                # TODO: natural keys
                chan_obj    = model.Channel.objects.language('en').filter(description = "Termometer reading")[0]
                par_obj     = model.Parameter.objects.language('en').filter(name = "Measured Space Temperature")[0]

                # Creating the measurement object
                # TODO: frequencies?
                model.Measurement.objects.create(session = sess_obj, parameter = par_obj, channel = chan_obj, channel_doc = docs[0], parameter_doc = docs[1], sampling_frequency = 1, max_frequency = 1, min_frequency = 1)

            ftp.cwd("..")


def roundabout(satellite_object):
    """
    [en]: Test set FTP data collection service (roundabout)
    [uk]: Сервіс забору тестових даних з FTP (roundabout)
    """
    def check():
        with util.ftp.FTPChecker("roundabout/", "172.17.0.1", 2121) as ftp:
            for v in ftp.check():
                yield v

    def fetch(data_id):
        general_fetch("roundabout/" + data_id, satellite_object, True)

    return check, fetch


def peace_love(satellite_object):
    """
    [en]: Test set FTP data collection service (peace & love)
    [uk]: Сервіс забору тестових даних з FTP (peace & love)
    """
    def check():
        with util.ftp.FTPChecker("peace_love/", "172.17.0.1", 2121) as ftp:
            for v in ftp.check():
                yield v

    def fetch(data_id):
        general_fetch("peace_love/" + data_id, satellite_object)

    return check, fetch
