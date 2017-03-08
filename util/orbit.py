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
# TODO: cut the oribit into multiple sections depending on the actual data
# (i.e. no track when no device was on in first place)
#def generate_orbit(datapoints):
    #time_start, time_end = min(datapoints.keys()), max(datapoints.keys())
    #time_dur = time_end - time_start

    ## Anchor points from which the curve is deduced
    ## anchor[t][0] returns the 2 known points before t, anchor[t][1] does same to points after t
    ## TODO: more elegant iteration
    #anchor = [ [ None for _ in range(2) ] for _ in range(time_dur + 1 ) ]
    #for k in range(2):
      #lastpts = []
      #for i in range(time_dur + 1 ):
        #t = (time_start + i) if k == 0 else (time_end - i)
        #l = i if k == 0 else time_dur - i
        #if t in datapoints:
          #anchor[l][k] = None
          #if len(lastpts)==2:
            #lastpts=lastpts[1:]
          #lastpts.append(l)
        #else:
          ## TODO: we assume that for every gap we do have points before and after to estimate the curve
          ## TODO: fix this
          #anchor[l][k] = tuple(lastpts)

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
                ## If we are dealing with longitudes around 180°/-180°, shift the negatives upwards
                #if j==2:
                    #if any(180 < abs(vals[x] - vals[y]) for x in range(4) for y in range(4) if x<y):
                        #vals = [ v + 360 if v < 0 else v for v in vals ]
                #K[j-1] = cubic_fit([x for x in zip(pts,vals)])

        ## Everything is set up, we can calculate the curve now
        #return tuple(t if i == 0 else # Pass t unchanged
                        #cube_fun(i-1,l) if i != 2 else (cube_fun(i-1,l) + 180) % 360 - 180 # Making sure longitude fits
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
    assert(xor(bool(end), bool(duration)))
           
    if not end:
        end = start + duration
    else:
        duration = start - end
        
    if orbit[0][0] > start or orbit[-1][0] < end:
        raise ValueError("Time interval requested is outside of the orbit given")
    
    offset = start - orbit[0][0]
    return orbit[offset, offset + duration]
