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

# TODO: maintain 1 continuous FTP object

from django.contrib.gis.geos import LineString
from classes.base_project import BaseProject

import orbit, ftp_helper, parsers, export, unix_time
import backend_api.models as model

# TODO: integrate into ftp.py somehow
from ftplib import error_perm

class Potential(BaseProject):
    '''
    [en]: POTENTIAL satellite experiment
    [uk]: Супутниковий експеримент ПОТЕНЦІАЛ
    '''

    def check(self):
        exceptions = {  "20111118",     # TODO: workaround, ignorning unprepared dirs
                        "20110831_2",   # TODO: workaround, why the hell this overlaps with 20110901?
                        "20110905",     # TODO: end of session outside of available telemetry data
                        "20111204",     # -//-
                        "20111211",     # TODO: no telemetry at all?
                        "20120123",     # -//-
                        "20120208",     # -//-
                        "20120328",     # -//-
                        "20120507",     # -//-
                        "20120508",     # -//-
                        "20120614",     # -//-
                        "20120130",     # TODO: range completely outside of available telemetry
                        "20120715",     # TODO: shizo orbit, very large gap at the end of measurement
                        "knap20120130.rar"
                        }

        with ftp_helper.FTPChecker("Potential/DECODED/", "promis.ikd.kiev.ua") as ftp:
            ftp.exceptions = exceptions

            # TODO: check that directory exists properly
            # TODO: any more elegant way? re-yield or smth
            for v in ftp.check():
                yield v

    def fetch(self, daydir):
        # TODO: create an FTP object ahead of time and reuse
        with ftp_helper.FTPChecker("Potential/DECODED/{0}/pdata{0}".format(daydir), "promis.ikd.kiev.ua") as ftp:
            # Fetching orbit telemetry data
            orbit_path = {}
            for fname in ftp.xlist("^tm.*\.txt$"):
                with ftp.xopen(fname) as fp:
                    # Retrieving and processing the raw file
                    rawdata = { t:pt for t, pt in parsers.telemetry(fp) }

                    # Append the data, assuming no repetitions can happen
                    orbit_path.update(rawdata)

                    # TODO: check if orbit is continous at all
                    # ANSWER: it sort of is, but not necessarily

            # TODO: Hypothesis: there is no overlap across differing devices
            for dev in ftp.xlist("^(ez|pd)$"):
                # TODO: I don't know nkp/ekp frequency so, ignoring them atm
                if dev == "pd":
                    continue

                # TODO: working code so far
                freqs = { "lf": 1, "hf": 1024 }
                dirs = { "lf": "0", "hf": "00" }

                # Device, Channel and Parameter discovery
                # TODO: delenda est, see #51
                # TODO: maybe do this before everything?
                # TODO: really bad code here
                ez_chan_txt = { "lf": "EZ low-frequency channel" , "hf": "EZ high-frequency channel" }
                ez_par_txt = { "lf": "Low-frequency potential measurement", "hf": "High-frequency potential measurement" }

                # TODO: check for existence etc, etc
                ez_chan = { k: model.Channel.objects.language('en').filter(name = v)[0] for k,v in ez_chan_txt.items() }
                ez_par = { k: model.Parameter.objects.language('en').filter(name = v)[0] for k,v in ez_par_txt.items() }

                ftp.cwd(dev)

                # Both EZ channels should start at the same time and measure for the same duration
                # TODO: maybe we need to conduct a more sophisticated comparison?
                ez_time_start = None
                ez_time_end   = None
                ez_sess_obj   = None

                # Checking for the valid directory
                for freq in ftp.xlist("^(%s)$" % "|".join(freqs.keys())):
                    ftp.cwd(freq)

                    # TODO: Some folders have "test" data instead "0"/"00", not sure what to do about them
                    try:
                        ftp.cwd(dirs[freq])

                        # Checking for -mv file, should be exactly one
                        mvfile = [ fname for fname in ftp.xlist("^%s[0-9-]*mv.set$" % freq) ]
                        csvfile = [ fname for fname in ftp.xlist("^%s[0-9-]*mv.csv$" % freq) ]
                        assert(len(mvfile) == 1 and len(csvfile) == 1)

                        # TODO: generalise with the earlier call
                        with ftp.xopen(mvfile[0]) as fp:
                            data = { k:v for k,v in parsers.sets(fp, {"utc", "samp"}) }
                            time_start = data["utc"]
                            time_end = data["utc"] + data["samp"] // freqs[freq]

                            # Check if we were the first
                            if not ez_time_start and not ez_time_end:
                                # Record the duration of the session for the next channel
                                ez_time_start = time_start
                                ez_time_end = time_end

                                # Generator for the orbit
                                g = orbit.generate_orbit(orbit_path, time_start, time_end)
                                line_gen = ( (y.lon, y.lat, y.alt, t) for t, y, _ in g )
                                # Converting time to python objects for convenience
                                # This is the point where onboard time gets converted to the UTC
                                time_start = unix_time.maketime(time_start)
                                time_end = unix_time.maketime(time_end)
                                time_dur = time_end - time_start
                                print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)) )

                                # Creating a session object
                                # TODO: make it more readable
                                # TODO: srid should be 4979 see #222
                                ez_sess_obj = model.Session.objects.create(time_begin = time_start, time_end = time_end, geo_line = LineString(*line_gen, srid = 4326), space_project = self.project_obj )

                                # TODO: record data_id in the object
                                # TODO: somehow generalise this process maybe
                            else:
                                # Check if the time values are the same
                                if ez_time_start != time_start or ez_time_end != time_end:
                                    raise ValueError("Temporal inconsistency between EZ channels: [%d:%d] is not [%d:%d]." % (ez_time_start, ez_time_end, time_start, time_end))

                        # Parse the actual datafile
                        with ftp.xopen(csvfile[0]) as fp:
                            # Creating the JSON document
                            mv = [ i[0] for i in parsers.csv(fp) ]
                            # TODO: discuss the meaning of last_mod in details
                            doc_obj = model.Document.objects.create(json_data = mv )

                            # Creating a measurement instance
                            # TODO: same doc right now
                            model.Measurement.objects.create(session = ez_sess_obj, parameter = ez_par[freq], channel = ez_chan[freq], channel_doc = doc_obj, parameter_doc = doc_obj, sampling_frequency = freqs[freq], max_frequency = freqs[freq], min_frequency = freqs[freq])

                        ftp.cwd("..")
                    except error_perm:
                        pass

                    ftp.cwd("..")

                ftp.cwd("..")
