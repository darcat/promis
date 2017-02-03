#!/usr/bin/env python3
from math import pi, atan, exp, sin, cos
from time import strftime, localtime

### Globals are bad
### Call the cops, I don't care

def ctime(u):
    return strftime("%Y-%m-%d %H:%M:%S", localtime(u)) # Might be timezone-dependent

# Points per orbit segment
orbit_pts = 20

# Time slice (seconds) between two point
orbit_sec = 1

# Number of times "Roundabout" turns around Earth
round_turns = 40

# Meridian speed, something like degrees per latitudal revolution
round_shift = 5

# Amount of points per specific orbit
heart_pts = int(4*60/orbit_sec)                     # 4 mins
peace_pts = int(2*60/orbit_sec)                     # 2 mins
lines_pts = int(1*60/orbit_sec)                     # 1 mins
round_pts = int(round_turns*2*60/orbit_sec)         # 2 mins for 1 revolution

# Times at the start of the orbit, UNIX seconds
heart_start = 0
peace_start = 3600
lines_start = 3600*2
utick_start = 3600*3
round_start = 3600*4  # TODO: currently sessions are not tied to spacecraft, it's wrong, so I'm avoiding the overlap

# TODO: make a proper satellite orbit
# TODO: really rewrite this mess
# TODO: ask why we have 2 lines on the original orbit (MultiLineString)

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

# Thx, stackoverflow
def chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]

### Inserting data generated
def insert_orbit(start_time, gen_function):
    time = start_time
    for v in chunks(gen_function(), orbit_pts):
        new_time = time + orbit_pts * orbit_sec
        # TODO: MultiLineString vs LinesString
        # TODO: orbit_code is defaulted to NULL
        # TODO: 4326 is seemingly the SRID corresponding to [-90;90]x[-180;180] lat/long coordinate system, verify this assumption
        print("insert into backend_api_sessions (time_begin, time_end, geo_line) values ('%s', '%s', ST_GeomFromText('LINESTRING(%s)', 4326));" % (ctime(time), ctime(new_time),
              ", ".join((str(i[0])+" "+str(i[1]) for i in v))))
        time = new_time


insert_orbit(heart_start, heart)
insert_orbit(peace_start, circle)
insert_orbit(lines_start, vline)
insert_orbit(utick_start, uptick)
insert_orbit(round_start, roundabout)
