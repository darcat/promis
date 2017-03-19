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
# TODO: split to ftp utils so that it can be reused
# TODO: onboard time is NOT unix timestamp!
# TODO: generalise the with StringIO() .. seek(0) call

from django.contrib.gis.geos import LineString
from ftplib import FTP, error_perm
import re
from io import StringIO
import util.orbit
import backend_api.models as model
import util.files

# TODO: move somewhre?
import datetime, pytz
def fromtimestamp(u):
    return datetime.datetime.fromtimestamp(u, tz=pytz.utc)

def guess_duration(n, freq):
    """
    Guess the duration of sampling based on number of samples and expected frequency.

    Assumes that the actual duration should be an integer number of minutes close to what
    dividing samples by frequency would suggest. Returns time in seconds.
    n       -- amount of samples.
    freq    -- reported frequency.
    """
    return 60*round(n/(freq*60))

def ftp_list(ftp, regex):
    """Generator returning filenames in current FTP directory matching a regular expression"""
    return (fname for fname in ftp.nlst() if re.search(regex, fname))

def data_func(satellite_object):
    """
    [en]: POTENTIAL data service
    [uk]: Служба данних ПОТЕНЦІАЛу
    """

    def check():
        with FTP("promis.ikd.kiev.ua") as ftp:
            ftp.login()
            ftp.cwd("Potential/DECODED/")
            # TODO: very lazy regex, not universal enough
            for daydir in ftp_list(ftp, "^20"):
                # TODO: workaround, ignorning unprepared dirs
                if daydir == "20111118":
                    continue

                # TODO: workaround, why the hell this overlaps with 20110901?
                # TODO: study actual data of both in spare time
                if daydir == "20110831_2":
                    continue

                # TODO: end of session outside of available telemetry data
                if daydir == "20110905" or daydir == "20111204":
                    continue

                # TODO: no telemetry at all?
                if ( daydir == "20111211" or daydir == "20120123" or daydir == "20120208" or
                    daydir == "20120328" or daydir == "20120507" or daydir == "20120508" or daydir == "20120614" ):
                    continue

                # TODO: range completely outside of available telemetry
                if daydir == "20120130":
                    continue

                # TODO: shizo orbit, very large gap at the end of measurement
                if daydir == "20120715":
                    continue

                # TODO: check that directory exists properly
                yield daydir

    def fetch(daydir):
        # TODO: create an FTP object ahead of time and reuse
        with FTP("promis.ikd.kiev.ua") as ftp:
            ftp.login()
            ftp.cwd("Potential/DECODED/{0}/pdata{0}".format(daydir))
            # Fetching orbit telemetry data
            orbit = {}
            for fname in ftp_list(ftp, "^tm.*\.txt$"):
                with StringIO() as fp:
                    # Retrieving and processing the raw file
                    ftp.retrlines("RETR " + fname, lambda x: fp.write(x + "\n"))
                    fp.seek(0)
                    rawdata = { t:pt for t, pt in util.files.telemetry(fp) }

                    # Append the data, assuming no repetitions can happen
                    orbit.update(rawdata)

                    # TODO: check if orbit is continous at all
                    # ANSWER: it sort of is, but not necessarily

            # TODO: Hypothesis: there is no overlap across differing devices
            for dev in ftp_list(ftp, "^(ez|pd)$"):
                # TODO: I don't know nkp/ekp frequency so, ignoring them atm
                if dev == "pd":
                    continue

                # TODO: working code so far
                freqs = { "lf": 1, "hf": 1000 }
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
                for freq in ftp_list(ftp, "^(%s)$" % "|".join(freqs.keys())):
                    ftp.cwd(freq)

                    # TODO: Some folders have "test" data instead "0"/"00", not sure what to do about them
                    try:
                        ftp.cwd(dirs[freq])

                        # Checking for -mv file, should be exactly one
                        mvfile = [ fname for fname in ftp_list(ftp, "^%s[0-9-]*mv.set$" % freq) ]
                        csvfile = [ fname for fname in ftp_list(ftp, "^%s[0-9-]*mv.csv$" % freq) ]
                        assert(len(mvfile) == 1 and len(csvfile) == 1)

                        # TODO: generalise with the earlier call
                        with StringIO() as fp:
                            ftp.retrlines("RETR " + mvfile[0], lambda x: fp.write(x + "\n"))
                            fp.seek(0)
                            data = { k:v for k,v in util.files.sets(fp, {"t", "samp"}) }
                            time_start = data["t"]
                            time_end = data["t"] + guess_duration(data["samp"], freqs[freq])

                            # Check if we were the first
                            if not ez_time_start and not ez_time_end:
                                # Record the duration of the session for the next channel
                                ez_time_start = time_start
                                ez_time_end = time_end

                                # Generator for the orbit
                                line_gen = ( (y.lon, y.lat) for _, y, _ in util.orbit.generate_orbit(orbit, time_start, time_end) )

                                # Converting time to python objects for convenience
                                time_start = fromtimestamp(time_start)
                                time_end = fromtimestamp(time_end)
                                time_dur = time_end - time_start
                                print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)) )

                                # Creating a session object
                                # TODO: make it more readable
                                ez_sess_obj = model.Session.objects.create(time_begin = time_start, time_end = time_end, geo_line = LineString(*line_gen, srid = 4326), satellite = satellite_object )

                                # TODO: record data_id in the object
                                # TODO: somehow generalise this process maybe
                            else:
                                # Check if the time values are the same
                                if ez_time_start != time_start or ez_time_end != time_end:
                                    raise ValueError("Temporal inconsistency between EZ channels.")

                        # Parse the actual datafile
                        with StringIO() as fp:
                            ftp.retrlines("RETR " + csvfile[0], lambda x: fp.write(x + "\n"))
                            fp.seek(0)
                            
                            # Creating the JSON document
                            mv = [ i for i in util.files.csv(fp) ]
                            # TODO: discuss the meaning of last_mod in details
                            doc_obj = model.Document.objects.create(json_data = { "mv": mv } )
                            
                            # Creating a measurement instance
                            # TODO: same doc right now
                            model.Measurement.objects.create(session = ez_sess_obj, parameter = ez_par[freq], channel = ez_chan[freq], chn_doc = doc_obj, par_doc = doc_obj, sampling_frequency = freqs[freq], max_frequency = freqs[freq], min_frequency = freqs[freq])

                        ftp.cwd("..")
                    except error_perm:
                        pass

                    ftp.cwd("..")

                ftp.cwd("..")

    return check, fetch
