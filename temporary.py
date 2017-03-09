#!/usr/bin/env python3
import re
from random import seed, randint
from ftplib import FTP
from io import StringIO

import util.orbit

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

def ftp_list(ftp, regex):
    """Generator returning filenames in current FTP directory matching a regular expression"""
    return (fname for fname in ftp.nlst() if re.search(regex, fname))

# Testing code below, will be removed
# TODO: split to functions
with FTP("promis.ikd.kiev.ua") as ftp:
    ftp.login()
    ftp.cwd("Potential/DECODED/")
    # TODO: very lazy regex, not universal enough
    for daydir in ftp_list(ftp, "^20"):
        # TODO: workaround, ignorning unprepared dirs
        if daydir == "20111118":
            continue
        # TODO: check that directory exists properly
        ftp.cwd("{0}/pdata{0}".format(daydir))
        # Fetching orbit telemetry data
        orbit = {}
        for fname in ftp_list(ftp, "^tm.*\.txt$"):
            with StringIO() as fp:
                # Retrieving and processing the raw file
                ftp.retrlines("RETR " + fname, lambda x: fp.write(x + "\n"))
                fp.seek(0)
                rawdata = dict(pt for pt in file_catalog(fp))
            
                # TODO: maybe check for overlaps or unusually high gaps
                if orbit:
                    dics = [ rawdata, orbit ]
                    mindist=min(abs(min(dics[i].keys()) - max(dics[1-i].keys())) for i in range(len(dics)))
                    print(mindist)
            
                # Append the data
                orbit.update(rawdata)
                
                # TODO: check if orbit is continous at all
            
        # Converting the orbit to 1 point per second format
        #orbits.append([ pt for pt in generate_orbit(rawdata) ])
        
        # Back to the top dir
        ftp.cwd("../..")
        

        
