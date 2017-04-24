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
"""Parser functions for the various common file types involved in the project"""

import re, struct
import util.orbit

# TODO: cull out those which have standard parsers (CSV?)
# TODO: replace ValueErrors with meaningful exception classes when integrating
# or make something like DataImportError(), whatever

def telemetry(fp):
    """
    Parses the telemetry .txt file used in Potential and possibly some other satellites.

    Yields time, (time, lon, lat) pairs.
    """
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
        yield (t - 378702000, pt) #  TODO: magic number

def sets(fp, keys=None):
    """
    Look up key=value pairs in a .set file used in Potential and possibly some other satellites.

    Value is assumed to be a number. If the key appears multiple times, only the first occurrence is returned.
    If keys is set to a set of strings, only yield keys from it.

    Yields key, value pairs.
    """
    # TODO: currently value is limited to integers, provide floats functionality of needed
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
        yield key, int(value) if key != "t" else int(value) -378702000

        # Reduce the counter of keys to look for and break if necessary
        if keys_left > 0:
            keys_left -= 1
            if keys_left == 0:
                break

def csv(fp, as_type=float):
    """
    Skips comments in a .csv file and yields values of the first column.

    fp      -- file descriptor.
    as_type -- type to convert to.

    Yields n-tuples of values.
    """
    # TODO: generalise for multiple columns
    # TODO: list/tuple option for as_type
    rexp_comment = r"^#"
    rexp_values  = r"([0-9-.e]+),?" # NOTE: numbers only

    while True:
        ln = fp.readline()
        if ln.rstrip() == "":
            break

        # Skipping the comments
        # TODO: anything of value here?
        if re.search(rexp_comment, ln):
            continue

        # Trying to extract the value
        values = []
        for m in re.finditer(rexp_values, ln):
            values.append(as_type(m.group(1)))
        if values:
            yield tuple(values)

def wkb(_wkb):
    """
    Parses Well-Known Binary and yields successive points. NOTE: Geometry input is assumed to be a single LineString, SRID=4326
    """
    # TODO: test if we can speed up things if we serialized in JSON on the fly
    # Setting endianness causes struct to use standard type sizes instead of native ones
    endianness = [ ">", "<" ] [ _wkb[0] ]

    # Check if we have a 2D Linestring
    if struct.unpack(endianness + "l", _wkb[1:5]) [0] != 2:
        raise ValueError("WKB parser can only do LineString for now")

    # Determine the point count
    pts_count = struct.unpack(endianness + "l", _wkb[5:5+4]) [0]

    # Get actual data
    for i in range(pts_count):
        # Each data point is 2 8-byte doubles, offset by header (9 bytes)
        offset = 1 + 4 + 4 + 8 * 2 * i
        yield struct.unpack(endianness + "dd", _wkb[offset:offset+16])
