#!/usr/bin/env python3
from math import pi, atan, exp, sin, cos

# Globals are bad
# Call the cops, I don't care
heart_pts = 10000
peace_pts = 10000
orbit_pts = 10000

# Points per orbit segment
orbit_pts = 20

# Time slice (seconds) per orbit segment
orbit_sec = 20

# Fake mercator considering Earth is a sphere
def cord_conv(x,y):
    return float(x),180.0/pi*(2.0*atan(exp(y*pi/180.0))-pi/2.0)

# Heart shape
def heart():
    return [ [ 45+2*16*sin(t)**3, 18*13*cos(t)-18*5*cos(2*t)-18*2*cos(3*t)-18*cos(4*t) ]
        for t in ((l-heart_pts/2)/(heart_pts*0.165)
            for l in range(heart_pts))]

#for i in heart():
#    print(str(i[0])+","+str(i[1]))
