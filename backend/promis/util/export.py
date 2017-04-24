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
"""Export related utilities, output file formats and so on"""

import collections
import math

# TODO: currently only one data row
# TODO: do we need this type or can we just have a tuple?
ExportEntry = collections.namedtuple("ExportEntry", [ "t", "lon", "lat", "data" ])

def make_table(data, start_time, end_time, orbit):
    """
    Yields rows of ExportEntries for data in data generator that is presumed to yield values.

    - Both start and end time are inclusive
    - data list must only have data between start_time and end_time
    - frequency is deduced from data length TODO: play around this
    - orbit is a list of orbit points during start_time and end_time, 1 pt per second
    """
    duration = end_time.timestamp() - start_time.timestamp() + 1
    samples_sz = len(data)
    assert samples_sz > 4
    freq = samples_sz / duration
    for i in range(samples_sz):
        # Computing relative time in sec
        t = i / freq

        # TODO currently not interpolating anything
        lon, lat = orbit[int(t)]

        """

        # On integer number of seconds we can just take the value from the table
        if t == int(t):
            lon, lat = orbit[t]
        else:
            # Picking the anchor points for interpolation
            f, c = math.floor(t), math.ceil(t)

            # Check if we are near the edges of the range or not
            if f == 0:
                ff = c + 2 # Pick the point after cc
            else
                ff = f - 1

            if c == duration:
                cc = f - 2 # Similar to above
            else:
                cc = c + 1

            anchor = [ ff, f, c, cc ]

            # Estimating the cubic function coeffs
        """

        yield ExportEntry(int(1e3 * (start_time.timestamp() + t)), lon, lat, data[i])


def ascii_export(table, datalabel="Data", dataunits="(units)"):
    """
    Takes a table generator from above and constructs an ASCII representation.

    datalabel and dataunits are used for the data column
    TODO: currently only one data column supported
    TODO: orbit no
    TODO: deduce correct field sizes

    Yields successive lines.
    """
    yield "{:^15} {:^6} {:^6} {:^10}".format("T", "Lon.", "Lat.", datalabel)
    yield "{:^15} {:^6} {:^6} {:^10}".format("(ms)", "(deg.)", "(deg.)", dataunits)
    for row in table:
        yield "{:>15} {:>6.02f} {:>6.02f} {:>10.06f}".format(row.t, row.lon, row.lat, row.data)


# TODO: remove after completion
if __name__ == "__main__":
    from time import time
    dt = [ x/7 for x in range(40) ]
    start = int(time()) + 0
    end = int(time()) + 10
    orbit = [ (i/3,i/3) for i in range(11) ]

    for ln in ascii_export(make_table(dt, start, end, orbit)):
        print(ln)
