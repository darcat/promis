#!/usr/bin/env python3
from math import ( pi, sin, cos, asin, acos, sqrt)
import re

# TODO: comments and descriptions
# TODO: maybe standard library methods to do this?

def sign(x):
    return 1 if x>=0 else -1

def rad2deg(x):
    return 180*x/pi

def cord_conv(rx, ry, rz):
    r   = sqrt(rx**2 + ry**2 + rz**2)
    phi = pi/2 - acos(rz/r)
    rho = acos(rx/(r*sin(pi/2 - phi))) * sign(ry)
    return r, rad2deg(rho), rad2deg(phi) # radius-vector length, longitude, latitude

def file_catalog(fp):
    def get_data():
        while True:
            # NOTE: assuming there always is an empty string before the sections
            ln = fp.readline()
            if ln.rstrip() == "":
                break
            # NOTE: expected format: <timestamp> <float value(.)> <human readable date>, ignoring the last one
            m = re.search("^([0-9]*) ([0-9.-]*)", ln)
            if m:
                yield ( int(m.group(1)), float(m.group(2)) )

    while True:
        # TODO: check if this list is exhaustive
        # TODO: what to do with units, are they always the same?
        ln = fp.readline()
        if ln == "":
            break
        m = re.search("^@([A-Za-z0-9-_]*)", ln)
        if m:
            # Yielding the section title and the generator for data acquisition
            yield ( m.group(1), get_data() )

with open("/tmp/tm200542.135.txt") as fp:
    for sect in file_catalog(fp):
        print("Section: " + sect[0])
        v = [x for x in sect[1]]
        print([x[0] for x in v])
        print([x[1] for x in v])
