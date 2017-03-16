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

from django.contrib.gis.geos import LineString
from ftplib import FTP, error_perm
import re
from io import StringIO
import util.orbit
import backend_api.models as model

# TODO: move somewhre?
import datetime, pytz
def fromtimestamp(u):
    return datetime.datetime.fromtimestamp(u, tz=pytz.utc)

# TODO: replace ValueErrors with meaningful exception classes when integrating
# or make something like DataImportError(), whatever

def file_catalog(fp):
    # We have a bit of a decision here:
    # 1. Read the file in one try reading each compontent into an in memory list
    # 2. Read one point per time, but seek all over the file
    # I'm going with route #2 for now, no particular reason, just think it will be more elegant in code

    # Pointers to the current reading positions in the file per section
    sections_index = { "RX": -1 , "RY": -1, "RZ": -1 }

    # Regular expression to match the sections above
    sections_rx = "^@(%s)" % "|".join(sections_index)

    # Populating the index
    while True: # Unable to use tell() with for interatin
        ln = fp.readline()
        if ln == "":
            break
        m = re.search(sections_rx, ln)
        if m:
            sect = m.group(1)
            if sections_index[sect] > 0:
                raise ValueError("Duplicate section detected")
            sections_index[sect] = fp.tell()

    # Checking if we found all the sections
    if any((pos < 0 for _,pos in sections_index.items())):
        raise ValueError("Some sections missing from input")

    def scan_sect(sect):
        while True:
            # Come back to the saved position
            fp.seek(sections_index[sect])

            # Read a line, exit the iteration if it's the end of input
            ln = fp.readline()
            if ln.rstrip() == "":
                break

            # Record the new position
            sections_index[sect] = fp.tell()

            # Try to parse the data
            # NOTE: expected format: <timestamp> <float value(.)> <human readable date>, ignoring the last one
            m = re.search("^([0-9]*) ([0-9.-]*)", ln)
            if m:
                # Yielding a nested tuple e.g. ( "RX", (1, 432.0) ), will be converted to dict
                yield ( sect, (int(m.group(1)), float(m.group(2))) )
            else:
                raise ValueError("Input inconsistency detected")

    def scan_point():
        # Generator objects for all the sections
        sect_gens = [scan_sect(sect) for sect in sections_index]
        try:
            while True:
                # Try reading the next point into a list, check if times are consistent
                nextpoint = [next(g) for g in sect_gens]
                timemark = nextpoint[0][1][0] # may throw an exception if len(nextpoint) == 0 for some reason

                if any(( pt[1][0] != timemark for pt in nextpoint )):
                    raise ValueError("Timemarks not consistent across sections evaluated")

                # Convert to dictionary and remove redundant timemarks
                nextpoint = dict(nextpoint)
                for k,v in nextpoint.items():
                    nextpoint[k] = v[1]

                yield timemark, util.orbit.cord_conv(**nextpoint)
        except StopIteration:
            pass

        # TODO: for super consistency, try advacing the rest of generators and
        # make sure all of them raise StopIteration or something?

    # Call the machinery above
    for t, pt in scan_point():
        yield (t, pt)

def setfile_vars(fp, keys=None):
    """
    Look up key=value pairs in a file.

    Value is assumed to be a number. If the key appears multiple times, only the first occurrence is returned.
    If keys is set to a set of strings, only yield keys from it.
    """
    keys_found = set()
    keys_left = -1 if not keys else len(keys)
    # TODO: currently only integers, see regex below and yield statement

    for m in re.finditer("([a-zA-Z_]+)=([0-9]+)", fp.getvalue()): # TODO: matches " = ", shouldn't ideally
        key = m.group(1)
        value = m.group(2)

        # Skip entries we've seen before
        # Skip entries we do not want
        # Temporary measure: skip empty entries
        if key in keys_found or (keys and key not in keys) or len(key) == 0 or len(value) == 0:
            continue

        # Register the key as found
        keys_found.add(key)

        # Yield the data
        yield key, int(value)

        # Reduce the counter of keys to look for and break if necessary
        if keys_left > 0:
            keys_left -= 1
            if keys_left == 0:
                break

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
                    rawdata = dict(pt for pt in file_catalog(fp))

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

                ftp.cwd(dev)

                # Checking for the valid directory
                for freq in ftp_list(ftp, "^(%s)$" % "|".join(freqs.keys())):
                    # TODO: this HAS to be the same session object
                    # workaround: only processing lf
                    # real solution: fetch both and compare data, fire an error if something mismatches
                    if freq == "hf":
                        continue

                    ftp.cwd(freq)

                    # TODO: Some folders have "test" data instead "0"/"00", not sure what to do about them
                    try:
                        ftp.cwd(dirs[freq])

                        # Checking for -mv file, should be exactly one
                        mvfile = [ fname for fname in ftp_list(ftp, "^%s[0-9-]*mv.set$" % freq) ]
                        assert(len(mvfile) == 1)

                        # TODO: generalise with the earlier call
                        with StringIO() as fp:
                            ftp.retrlines("RETR " + mvfile[0], lambda x: fp.write(x + "\n"))
                            fp.seek(0)
                            data = { k:v for k,v in setfile_vars(fp, {"t", "samp"}) }
                            time_start = data["t"]
                            time_end = data["t"] + guess_duration(data["samp"], freqs[freq])

                            # Generator for the orbit
                            line_gen = ( (y.lon, y.lat) for _, y, _ in util.orbit.generate_orbit(orbit, time_start, time_end) )

                            # Converting time to python objects for convenience
                            time_start = fromtimestamp(time_start)
                            time_end = fromtimestamp(time_end)
                            time_dur = time_end - time_start
                            print("\tSession: [ %s, %s ] (%s)." % (time_start.isoformat(), time_end.isoformat(), str(time_dur)) )

                            # Creating a session object
                            # TODO: make it more readable
                            sess_obj = model.Session.objects.create(time_begin = time_start, time_end = time_end, geo_line = LineString(*line_gen, srid = 4326), satellite = satellite_object )

                            # TODO: record data_id in the object
                            # TODO: somehow generalise this process maybe

                        ftp.cwd("..")
                    except error_perm:
                        pass

                    ftp.cwd("..")

                ftp.cwd("..")


    return check, fetch
