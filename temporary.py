#!/usr/bin/env python3
from math import ( pi, sin, cos, asin, acos, sqrt)
import re

# TODO: comments and descriptions
# TODO: maybe standard library methods to do this?

def sign(x):
    return 1 if x>=0 else -1

def rad2deg(x):
    return 180*x/pi

def cord_conv(t, rx, ry, rz):
    r   = sqrt(rx**2 + ry**2 + rz**2)
    phi = pi/2 - acos(rz/r)
    rho = acos(rx/(r*sin(pi/2 - phi))) * sign(ry)
    # TODO: do we need to save rx,ry,rz too?
    return ( t, r, rad2deg(rho), rad2deg(phi) ) # radius-vector length, longitude, latitude

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
                pass # TODO throw exception: duplicate section
            sections_index[sect] = fp.tell()

    # Checking if we found all the sections
    if any((pos < 0 for _,pos in sections_index.items())):
        pass # TODO throw exception: not all sections found

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
                pass # TODO throw exception: inconsistent input

    def scan_point():
        # Generator objects for all the sections
        sect_gens = [scan_sect(sect) for sect in sections_index]
        try:
            while True:
                # Try reading the next point into a list, check if times are consistent
                nextpoint = [next(g) for g in sect_gens]
                if len(nextpoint) <= 0 or any(( pt[1][0] != nextpoint[0][1][0] for pt in nextpoint )):
                    pass # TODO throw exception: temporal inconsistency

                yield dict(nextpoint)
        except StopIteration:
            pass

        # TODO: for super consistency, try advacing the rest of generators and
        # make sure all of them raise StopIteration or something?

    print([x for x in scan_point()])

with open("/tmp/tm200542.135.txt") as fp:
    file_catalog(fp)
    # for sect in file_catalog(fp):
    #     print("Section: " + sect[0])
    #     v = [x for x in sect[1]]
    #     print([x[0] for x in v])
    #     print([x[1] for x in v])
