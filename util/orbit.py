#!/usr/bin/env python3
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

import math
import collections
import operator
import util.cubefit

def sign(x):
    """Returns 1 for non-negative arguments and -1 otherwise."""
    return 1 if x>=0 else -1

def rad2deg(x):
    """Converts radians to degrees."""
    return 180*x/math.pi

OrbitPoint = collections.namedtuple("OrbitPoint", [ "lon", "lat" ])

def cord_conv(RX, RY, RZ, **kwargs):
    """Converts coordinates in ECEF cartesian system to radius, longitude and latitude."""
    # TODO: is rotation included?
    # TODO: resulting tuple only has lon/lat, add fields if necessary
    r   = math.sqrt(RX**2 + RY**2 + RZ**2)
    phi = math.pi/2 - math.acos(RZ/r)
    rho = math.acos(RX/(r*math.sin(math.pi/2 - phi))) * sign(RY)
    # Vector from origin, Longitude, Latitude
    return OrbitPoint(rad2deg(rho), rad2deg(phi))

# Generating an orbit point every 1 second, discarding extra point and filling the gaps
def generate_orbit(datapoints, orbit_start, orbit_end):
    datakeys = datapoints.keys()
    time_start, time_end = min(datakeys), max(datakeys)
    orbit_len = orbit_end - orbit_start

    assert(orbit_end <= time_end and orbit_start >= time_start)

    # Anchor points from which the curve is deduced
    # anchor[t] is a list of 4 known timepoints: 2 before t + 2 after t if possible
    anchor =  [ [] ] * (orbit_len + 1)

    # Pass 1: Picking up 2 the closest points before the start of the orbit
    # and 2 after the start
    # TODO: corner case "no points after" (yes, here too)
    i = orbit_start
    future_pts = 0
    while len(anchor[0]) + future_pts < 2:
        if i in datakeys:
            anchor[0].insert(0, i)
        i -= 1
        # If we stepped outside of available points, stop
        if i < time_start:
            future_pts += 1

    i = orbit_start + 1
    while len(anchor[0]) < 4:
        if i in datakeys:
            anchor[0].append(i)
        i += 1

    # Pass 2: Copying the anchor over as long as no new points are encountered
    # If we do encounter a new point, shift the list to the left and add it
    last_anchor = 0
    no_pts_after = False
    for j in range(orbit_start, orbit_end + 1):
        # We are inside the gap, fill with last good value
        if (anchor[last_anchor][1 - future_pts] <= j < anchor[last_anchor][2 - future_pts]) or no_pts_after:
            anchor[j - orbit_start] = anchor[last_anchor]
        else:
            # If the left bound wasn't filled, skip the shift too
            if future_pts > 0:
                anchor[j - orbit_start] = anchor[last_anchor]
                future_pts -= 1
            else:
                while i not in datapoints:
                    i += 1
                    # If we stepped out of datapoints, just reuse the last curve
                    if i > time_end:
                        no_pts_after = True
                        anchor[j - orbit_start] = anchor[last_anchor]
                        break
                else:
                    anchor[j - orbit_start] = anchor[last_anchor][1:4] + [i]
                    last_anchor = j - orbit_start
                    i += 1

    # Pass 3: Yielding values we know and generating values we don't
    for j in range(orbit_start, orbit_end + 1):
        f, last_pts = None, None

        # NOTE: has side effects
        def predict(t):
            nonlocal f, last_pts
            # Check if we need the same points that we computed before
            l = j - orbit_start
            if last_pts != anchor[l]:
                last_pts = anchor[l]
                # Shifting all the time values by orbit_start to prevent overflows
                v = [ pt for pt in (x - orbit_start for x in anchor[l]) ]
                # Source points and components
                src_cmps = [ [ pt[i] for pt in (datapoints[z] for z in anchor[l]) ] for i in range(2) ] # NOTE: hardcode
                # If we are dealing with longitudes around 180°/-180°, shift the negatives upwards
                if any(180 < abs(src_cmps[0][x] - src_cmps[0][y]) for x in range(4) for y in range(4) if x<y):
                    src_cmps[0] = [ v + 360 if v < 0 else v for v in src_cmps[0] ]
                # Generating the cubic functions
                f = [ util.cubefit.cubic_fit(v, cmp) for cmp in src_cmps ]

            res_vals = [ f[i](t - orbit_start) for i in range(2) ]
            # Making sure longitude fits
            res_vals[0] = ( res_vals[0] + 180 ) % 360 - 180
            return OrbitPoint(*res_vals)

        yield j, datapoints[j] if j in datapoints else predict(j), False if j in datapoints else True


    ## Second pass, trying to fill the gaps at the end
    #for k in [-1, 1]:
        #start = 0 if k == 1 else time_dur
        #first = start
        ## Searching for the first good point
        #while any(not anchor[first][z] for z in range(2)) or sum(len(anchor[first][z]) for z in range(2)) < 4:
            #first += k
        #goodpt = anchor[first]
        #for i in range(start, first, k):
            #if all(anchor[i][z] for z in range(2)): # If this is not [None,None]
                #anchor[i] = goodpt

    ## Currently estimated cubic function coeffs
    #K = None

    ## Point set the estimate was done for
    #last_pts = None

    ## Generate a point at time t, assuming we don't have such a point in first place
    ## TODO: Has side effects
    #def orbit_predict(t):
        #nonlocal last_pts, K, anchor

        ## Cubic function for the j-th compontent of the tuple at time t
        #def cube_fun(j,t):
            #return sum(K[j][i]*(t**(3-i)) for i in range(4))

        ## Sanity checks
        #if t < time_start or t > time_end:
            #raise ValueError("Something is wrong with iteration, check your code.")
        #l = t - time_start

        ## Check for ranges not having enough points
        #assert(all(len(anchor[l][i]) >= 2 for i in range(2)))

        ## Initialising K if necessary
        #if not K:
            #K = [ None for _ in range(3) ]

        ## Picking the points to construct the curve from
        #pts = tuple(anchor[l][x][y] for x in range(2) for y in range(2))

        ## Check if we calculated the parameters for the curve before, if not, do it
        #if not last_pts == pts:
            #last_pts = pts
            #for j in range(1,4):
                ## Combinig t with component values
                #vals = [ datapoints[time_start + i][j] for i in pts ]
                #K[j-1] = cubic_fit([x for x in zip(pts,vals)])

        ## Everything is set up, we can calculate the curve now
        #return tuple(t if i == 0 else # Pass t unchanged
                            #for i in range(4))

    ## Iterate over all the time period and yield the values stored or the estimates if they are missing
    #for t in range(time_start, time_end + 1): # TODO: remove tuple nesting if we don't care which points are estimated
        #yield (datapoints[t], 0) if t in datapoints else (orbit_predict(t), 1)

def orbit_slice(orbit, start, duration=None, end=None):
    """Cut a part of the orbit corresponding to the given time interval.

    Orbit is assumed to have 1 Hz discretization and continous.

    Arguments:
    orbit       -- the list of (t, y) tuples where t is time and y is an aggregate type of actual positional values.
    start       -- the lower bound of the time interval requested, sec.
    end         -- the upper bound of the time interval requested, sec; mutually exclusive with duration.
    duration    -- the duration of the time interval requested, sec; mutually exclusive with end.

    """
    assert(operator.xor(bool(end), bool(duration)))

    if not end:
        end = start + duration
    else:
        duration = start - end

    if orbit[0][0] > start or orbit[-1][0] < end:
        raise ValueError("Time interval requested is outside of the orbit given")

    offset = start - orbit[0][0]
    return orbit[offset, offset + duration]

# Self-testing
# if __name__ == "__main__":
#     # TODO: completely open ends
#     # TODO: curve is not completely smooth, should we take care of it?
#     data = { 50: -0.448589841, 80: 0.005068112, 110:0.386954047, 120:0.390755277, 130: 1.468537330, 150: 0.214829568, 190:-0.7266196521 }
#     tests = [ [90, 140],  # Good
#               [90, 160],  # No pts after
#               [70, 140],  # No pts before
#               [80, 150] ] # Risky
#     for test in tests:
#         for x,y in generate_orbit(data, *test):
#             print(x,y)
