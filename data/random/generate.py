#!/usr/bin/env python3
from math import pi, atan, exp, sin, cos

# Globals are bad
# Call the cops, I don't care
heart_pts = 10000
peace_pts = 10000
lines_pts = 2000
round_pts = 100000

# TODO: make a proper satellite orbit
# TODO: really rewrite this mess

# Number of times "Roundabout" turns around Earth
round_turns = 20

# Meridian speed, something like degrees per latitudal revolution
round_shift = 5

# Points per orbit segment
orbit_pts = 20

# Time slice (seconds) per orbit segment
orbit_sec = 20

# Fake mercator considering Earth is a sphere
def cord_conv(x,y):
    return [ float(x),180.0/pi*(2.0*atan(exp(y*pi/180.0))-pi/2.0) ]

# Ensures the number doesn't exceed 180
def clamp180(x):
    return x > 180 and (x+180)%360-180 or x

# TODO: aspect ratio maaaybe?

### Satellite "Love&Peace" somehow flies an orbit that is projected as a heart and pacific sign

# Heart shape
def heart():
    return [ cord_conv(-90+4*16*sin(t)**3, 3*13*cos(t)-3*5*cos(2*t)-3*2*cos(3*t)-3*cos(4*t))
        for t in ((i-heart_pts/2)/(heart_pts*0.165)
            for i in range(heart_pts))]
# Circle
def circle():
    return [ cord_conv(90+60*cos(t), 30*sin(t))
        for t in ((2*pi*i/peace_pts)
            for i in range(peace_pts))]

# Vertical line [-45;45]
def vline():
    return [ cord_conv(90, t*35)
        for t in (2*(float(i)/lines_pts-0.5)
            for i in range(lines_pts))]

# Upwards tick
def uptick():
    return [ cord_conv(90+t*50,-5-abs(t*30))
        for t in (2*(float(i)/lines_pts-0.5)
            for i in range(lines_pts))]

### Satellite "Roundabout" starts at equator on longitude 0 slowly changes meridians

# Yes I know this is not how satellites work
def roundabout():
    return [ [ clamp180(round_shift*17*t/pi), 80*sin(t) ]
        for t in ((2*round_turns*pi*i/round_pts)
            for i in range(round_pts))]
