#!/usr/bin/env python3
from math import ( pi, sin, cos, asin, acos, sqrt)
import re
from random import seed, randint

# TODO: comments and descriptions
# TODO: maybe standard library methods to do this?
# TODO: replace ValueErrors with meaningful exception classes when integrating
# or make something like DataImportError(), whatever

def lon(x):
    return (x + 180) % 360 - 180

def sign(x):
    return 1 if x>=0 else -1

def rad2deg(x):
    return 180*x/pi

def cord_conv(t, RX, RY, RZ):
    r   = sqrt(RX**2 + RY**2 + RZ**2)
    phi = pi/2 - acos(RZ/r)
    rho = acos(RX/(r*sin(pi/2 - phi))) * sign(RY)
    # TODO: do we need to save rx,ry,rz too?
    # TODO: do we need a dict/named tuple here?
    # Time(Key), (Time, Vector from origin, Longitude, Latitude)
    return ( t, (t, r, rad2deg(rho), rad2deg(phi) ))

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

    # Linear interpolation parameters since last point where the gap began
    linear_k, linear_b = None, None

    # Time at which the current interpolation starts and ends
    linear_start, linear_end = None, None

    # Generate a point at time t, assuming we don't have such a point in first place
    # TODO: Currently linear interpolation between two adjacent points
    # TODO: Has side effects tied to iteration below
    def orbit_predict(t):
        nonlocal linear_k, linear_b, linear_start, linear_end
        if t < time_start or t > time_end:
            raise ValueError("Something is wrong with iteration, check your code.")

        # Okay, this has to be the first point of interpolation
        if not linear_start:
            if t - 1 not in datapoints:
                raise ValueError("Found a gap, but previous point unavailab, check your code.")
            linear_start = t - 1

            # Looking for the next known point
            linear_end = t + 1
            while linear_end not in datapoints:
                linear_end += 1
                if linear_end > time_end:
                    raise ValueError("Can not find the gap edge, check your code.")

            # Estimating parameters, automatic cast to float in Python3
            delta_y = [ (datapoints[linear_end][i] - datapoints[linear_start][i]) for i in range(4) ]
            # Correcting longitude overflows
            delta_y[2] = lon(delta_y[2])
            delta_x = linear_end - linear_start

            linear_k = [ delta_y[i] / delta_x for i in range(4) ]
            linear_b = [ datapoints[linear_start][i] - linear_k[i] * linear_start for i in range(4) ]
            linear_b[2] = lon(linear_b[2]) # TODO: verify if we need this

        # Calculate the point in question
        # TODO: magic number
        result = tuple(linear_k[i] * t + linear_b[i] if i!=2 else lon(linear_k[i] * t + linear_b[i]) for i in range(4))

        # Erase data if the next point is the end of interpolation
        if t + 1 == linear_end:
            linear_k, linear_b, linear_start, linear_end = None, None, None, None

        return result

    for t in range(time_start, time_end + 1): # TODO: remove tuple nesting if we don't care which points are estimated
        yield (datapoints[t], 0) if t in datapoints else (orbit_predict(t), 1)
  

# TODO: any more standard way?
# Matrix representation:
# - Input data in a big list
# - list of lists which represent rows, elements are indices in the original big list

# Determinant of a 3x3 matrix
def det3(m, idx):
  def A(i,j):
    return m[idx[i][j]]
  
  return A(0,0)*( A(1,1)*A(2,2) - A(1,2)*A(2,1) ) - A(0,1)*( A(1,0)*A(2,2) - A(1,2)*A(2,0) ) + A(0,2)*( A(1,0)*A(2,1) - A(1,1)*A(2,0) )


m = [ 1, 2, 3, 0, -4, 1, 0, 3, -1 ]
idx = [ [ 0, 1, 2], [ 3, 4, 5], [ 6, 7, 8] ]

print(det3(m, idx))

# Determinant of a 4x4 matrix
def det4(m):
  pass

# Deduce coefs of a cubic spline of the form ax^3 + bx^2 + cx + d = y(x)
def cubic_spline(pts):
  pass
  
  

# Testing code below, will be removed
#datapoints = None
#with open("/tmp/tm200542.135.txt") as fp:
    #datapoints = dict(pt for pt in file_catalog(fp)) # NOTE: duplicate time values overwrite each other

#print("t, r, lon, lat, is.estimated")
#for pt in generate_orbit(datapoints):
    #print(",".join(str(i) for i in pt[0]) + "," + str(pt[1]))
