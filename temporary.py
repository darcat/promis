#!/usr/bin/env python3
import re
from random import seed, randint
from ftplib import FTP
from io import StringIO
from operator import xor

# TODO: comments and descriptions
# TODO: maybe standard library methods to do this?
# TODO: replace ValueErrors with meaningful exception classes when integrating
# TODO: prettify the code at times
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
                nextpoint["t"] = timemark

                yield cord_conv(**nextpoint)
        except StopIteration:
            pass

        # TODO: for super consistency, try advacing the rest of generators and
        # make sure all of them raise StopIteration or something?

    # Call the machinery above
    for pt in scan_point():
        yield pt

# Generating an orbit point every 1 second, discarding extra point and filling the gaps
# TODO: cut the oribit into multiple sections depending on the actual data
# (i.e. no track when no device was on in first place)
def generate_orbit(datapoints):
    time_start, time_end = min(datapoints.keys()), max(datapoints.keys())
    time_dur = time_end - time_start

    # Anchor points from which the curve is deduced
    # anchor[t][0] returns the 2 known points before t, anchor[t][1] does same to points after t
    # TODO: more elegant iteration
    anchor = [ [ None for _ in range(2) ] for _ in range(time_dur + 1 ) ]
    for k in range(2):
      lastpts = []
      for i in range(time_dur + 1 ):
        t = (time_start + i) if k == 0 else (time_end - i)
        l = i if k == 0 else time_dur - i
        if t in datapoints:
          anchor[l][k] = None
          if len(lastpts)==2:
            lastpts=lastpts[1:]
          lastpts.append(l)
        else:
          # TODO: we assume that for every gap we do have points before and after to estimate the curve
          # TODO: fix this
          anchor[l][k] = tuple(lastpts)

    # Second pass, trying to fill the gaps at the end
    for k in [-1, 1]:
        start = 0 if k == 1 else time_dur
        first = start
        # Searching for the first good point
        while any(not anchor[first][z] for z in range(2)) or sum(len(anchor[first][z]) for z in range(2)) < 4:
            first += k
        goodpt = anchor[first]
        for i in range(start, first, k):
            if all(anchor[i][z] for z in range(2)): # If this is not [None,None]
                anchor[i] = goodpt

    # Currently estimated cubic function coeffs
    K = None

    # Point set the estimate was done for
    last_pts = None

    # Generate a point at time t, assuming we don't have such a point in first place
    # TODO: Has side effects
    def orbit_predict(t):
        nonlocal last_pts, K, anchor

        # Cubic function for the j-th compontent of the tuple at time t
        def cube_fun(j,t):
            return sum(K[j][i]*(t**(3-i)) for i in range(4))

        # Sanity checks
        if t < time_start or t > time_end:
            raise ValueError("Something is wrong with iteration, check your code.")
        l = t - time_start

        # Check for ranges not having enough points
        assert(all(len(anchor[l][i]) >= 2 for i in range(2)))

        # Initialising K if necessary
        if not K:
            K = [ None for _ in range(3) ]

        # Picking the points to construct the curve from
        pts = tuple(anchor[l][x][y] for x in range(2) for y in range(2))

        # Check if we calculated the parameters for the curve before, if not, do it
        if not last_pts == pts:
            last_pts = pts
            for j in range(1,4):
                # Combinig t with component values
                vals = [ datapoints[time_start + i][j] for i in pts ]
                # If we are dealing with longitudes around 180°/-180°, shift the negatives upwards
                if j==2:
                    if any(180 < abs(vals[x] - vals[y]) for x in range(4) for y in range(4) if x<y):
                        vals = [ v + 360 if v < 0 else v for v in vals ]
                K[j-1] = cubic_fit([x for x in zip(pts,vals)])

        # Everything is set up, we can calculate the curve now
        return tuple(t if i == 0 else # Pass t unchanged
                        cube_fun(i-1,l) if i != 2 else (cube_fun(i-1,l) + 180) % 360 - 180 # Making sure longitude fits
                            for i in range(4))

    # Iterate over all the time period and yield the values stored or the estimates if they are missing
    for t in range(time_start, time_end + 1): # TODO: remove tuple nesting if we don't care which points are estimated
        yield (datapoints[t], 0) if t in datapoints else (orbit_predict(t), 1)

# Testing code below, will be removed
# TODO: split to functions
#with FTP("promis.ikd.kiev.ua") as ftp:
    #ftp.login()
    #ftp.cwd("Potential/DECODED/")
    #ftp.cwd("20110923/pdata20110923")
    ## Fetching orbit telemetry data
    #orbits = []
    #for fname in (fname for fname in ftp.nlst() if re.search("^tm.*\.txt$", fname)):
        #with StringIO() as fp:
            ## Retrieving and processing the raw file
            #ftp.retrlines("RETR " + fname, lambda x: fp.write(x + "\n"))
            #fp.seek(0)
            #rawdata = dict(pt for pt in file_catalog(fp))

            ## Converting the orbit to 1 point per second format
            #orbits.append([ pt for pt in generate_orbit(rawdata) ])
    #print(orbits)
    #print(len(orbits))
    
def orbit_slice(orbit, start, duration=None, end=None):
    """Cut a part of the orbit corresponding to the given time interval.
    
    Orbit is assumed to have 1 Hz discretization and continous.
    
    Arguments:
    orbit       -- the list of (t, y) tuples where t is time and y is an aggregate type of actual positional values.
    start       -- the lower bound of the time interval requested, sec.
    end         -- the upper bound of the time interval requested, sec; mutually exclusive with duration.
    duration    -- the duration of the time interval requested, sec; mutually exclusive with end.
    
    """
    assert(xor(bool(end), bool(duration))
           
    if not end:
        end = start + duration
    else:
        duration = start - end
        
    if orbit[0][0] > start or orbit[-1][0] < end:
        raise ValueError("Time interval requested is outside of the orbit given")
    
    offset = start - orbit[0][0]
    return orbit[offset, offset + duration]
        
