#!/usr/bin/env python3
from math import ( PI, sin, cos, asin, acos, sqrt)

# TODO: comments and descriptions
# TODO: maybe standard library methods to do this?

def sign(x):
    return 1 if x>=0 or -1

def rad2deg(x):
    return 180*x/PI

def cord_conv(rx, ry, rz):
    r   = sqrt(rx**2 + ry**2 + rz**2)
    phi = PI/2 - acos(rz/r)
    rho = acos(rx/(r*sin(PI/2 - phi))) * sign(ry)
    return r, rad2deg(rho), rad2deg(phi) # radius-vector length, longitude, latitude
