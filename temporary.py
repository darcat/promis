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
        
# TODO: any more standard way?
# Matrix representation:
# - Input data in a big list
# - list of lists which represent columns, elements are indices in the original big list

# Determinant of a 4x4 matrix
def det4(m, idx):
  def mat(a,b,idx):
    return m[idx[b][a]]
  def A(a,b):
    return mat(a,b,idx)
  
  # Determinant of a 3x3 matrix
  def det3(m, idx):
    def A(a,b):
      return mat(a,b,idx)
    return A(0,0)*( A(1,1)*A(2,2) - A(1,2)*A(2,1) ) - A(0,1)*( A(1,0)*A(2,2) - A(1,2)*A(2,0) ) + A(0,2)*( A(1,0)*A(2,1) - A(1,1)*A(2,0) )
  
  # Returns a i-th, j-th minor of index 4x4 matrix idx
  def minor(j, i, idx):
    result = idx[:i] + idx[i+1:]
    for k, col in enumerate(result):
      result[k] = col[:j] + col[j+1:]
    return result  

  result = 0
  sign = -1
  for i in range(4):
    sign *= -1 
    result += sign * A(0, i) * det3(m, minor(0, i, idx))
  return result


# Deduce coefs of a cubic spline of the form ax^3 + bx^2 + cx + d = y(x)
def cubic_fit(pts):
  def extdet(i):
    newidx = idx[:i] + [ [ 16 + i for i in range(4) ] ] + idx[i+1:]
    return det4(m, newidx)    
  
  m = [ pts[j % 4][0]**((15-j)//4) for j in range(16) ]
  idx =  [ [ i+4*j for i in range(4)] for j in range(4) ]
  m += [ pts[j][1] for j in range(4) ]
  D = det4(m, idx) 
  if D==0:
    raise ValueError("Can not solve the equation")
  return [ extdet(i)/D for i in range(4) ]

# Generating an orbit point every 1 second, discarding extra point and filling the gaps
# TODO: cut the oribit into multiple sections depending on the actual data
# (i.e. no track when no device was on in first place)
def generate_orbit(datapoints):
    time_start, time_end = min(datapoints.keys()), max(datapoints.keys())
      
    # Anchor points from which the curve is deduced
    # anchor[t][0] returns the 2 known points before t, anchor[t][1] does same to points after t
    anchor = [ [ None for _ in range(2) ] for _ in range(time_end - time_start + 1 ) ] 
    for k in range(2):
      lastpts = []
      for i in range(time_end - time_start + 1 ):
        t = (time_start + i) if k == 0 else (time_end - i)
        l = i if k == 0 else time_end - time_start - i
        if t in datapoints:
          anchor[l][k] = None
          if len(lastpts)==2:
            lastpts=lastpts[1:]
          lastpts.append(l)
        else:
          # TODO: we assume that for every gap we do have points before and after to estimate the curve
          # TODO: fix this
    #      assert(len(lastpts)==2)
          anchor[l][k] = tuple(lastpts)
    
    # Currently estimated cubic function coeffs 
    K = None
    
    # Point set the estimate was done for
    last_pts = None

    # Generate a point at time t, assuming we don't have such a point in first place
    # TODO: Has side effects
    def orbit_predict(t):
        # Cubic function
        def cube_fun(j,t):
            return sum(K[j][i]*(t**(3-i)) for i in range(4))
        
        
        nonlocal K, anchor
        if t < time_start or t > time_end:
            raise ValueError("Something is wrong with iteration, check your code.")
        
        l = t - time_start
        
        if any(len(anchor[l][i]) < 2 for i in range(2)):
            return (t, 0, 0.0, 0.0) # TODO broken range, need an extra point for estimation
        
        if not K:
            K = [ None for _ in range(3) ]
            
        # TODO add cache
        pts = (anchor[l][0][0], anchor[l][0][1], anchor[l][1][1], anchor[l][1][0]) # TODO: replace with generator expression
        last_pts = pts
        for j in range(1,4):
            vals = [ datapoints[time_start + i][j] for i in pts ]
            K[j-1] = cubic_fit([x for x in zip(pts,vals)])
                
        return tuple(t if i ==0 else cube_fun(i-1,l) for i in range(4))

        ## Okay, this has to be the first point of interpolation
        #if not anchor:
            #if t - 1 not in datapoints:
                #raise ValueError("Found a gap, but previous point unavailab, check your code.")
            #linear_start = t - 1

            ## Looking for the next known point
            #linear_end = t + 1
            #while linear_end not in datapoints:
                #linear_end += 1
                #if linear_end > time_end:
                    #raise ValueError("Can not find the gap edge, check your code.")

            ## Estimating parameters, automatic cast to float in Python3
            #delta_y = [ (datapoints[linear_end][i] - datapoints[linear_start][i]) for i in range(4) ]
            ## Correcting longitude overflows
            #delta_y[2] = lon(delta_y[2])
            #delta_x = linear_end - linear_start

            #linear_k = [ delta_y[i] / delta_x for i in range(4) ]
            #linear_b = [ datapoints[linear_start][i] - linear_k[i] * linear_start for i in range(4) ]
            #linear_b[2] = lon(linear_b[2]) # TODO: verify if we need this

        ## Calculate the point in question
        ## TODO: magic number
        #result = tuple(linear_k[i] * t + linear_b[i] if i!=2 else lon(linear_k[i] * t + linear_b[i]) for i in range(4))

        ## Erase data if the next point is the end of interpolation
        #if t + 1 == linear_end:
            #linear_k, linear_b, linear_start, linear_end = None, None, None, None

        #return result

    for t in range(time_start, time_end + 1): # TODO: remove tuple nesting if we don't care which points are estimated
        yield (datapoints[t], 0) if t in datapoints else (orbit_predict(t), 1)
  

# Testing code below, will be removed
datapoints = None
with open("/tmp/tm200542.135.txt") as fp:
    datapoints = dict(pt for pt in file_catalog(fp)) # NOTE: duplicate time values overwrite each other

print("t, r, lon, lat, is.estimated")
for pt in generate_orbit(datapoints):
    print(",".join(str(i) for i in pt[0]) + "," + str(pt[1]))
