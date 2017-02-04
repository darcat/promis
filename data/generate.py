#!/usr/bin/env python3
from math   import pi, atan, exp, sin, cos
from time   import strftime, localtime
from json   import dumps
from random import seed, randint

# WARNING: this removes your database!

### Globals are bad
### Call the cops, I don't care
random_seed = 42

def ctime(u):
    return strftime("%Y-%m-%d %H:%M:%S", localtime(u)) # Might be timezone-dependent

def dtime(u):
    return strftime("%Y-%m-%d", localtime(u)) # Might be timezone-dependent

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
peace_start = heart_start + 3600
lines_start = peace_start + 3600
utick_start = lines_start + 3600
round_start = utick_start + 3600  # TODO: currently sessions are not tied to spacecraft, it's wrong, so I'm avoiding the overlap

# TODO: make a proper satellite orbit
# TODO: ask why we have 2 lines on the original orbit (MultiLineString)
# TODO: sql injection prevention (not that it's a concern for tests, but ..)

# Lazy implementation of a successive number generator
# NOTE: you may want to reuse this later:
#   insert ... returning id;
#   drop table if exists _var;
#   select lastval() into _var;
#   ...
#   somefunc(..., (select * from _var), ...)
def getid(table):
    if not table in getid.ids:
        getid.ids[table] = 0
    getid.ids[table] += 1
    return getid.ids[table] - 1
getid.ids = {}

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
def insert_orbit(start_time, gen_func, data_func=None):
    time = start_time
    for v in chunks(gen_func(), orbit_pts):
        new_time = time + orbit_pts * orbit_sec
        # TODO: MultiLineString vs LinesString
        # TODO: orbit_code is defaulted to NULL
        # TODO: 4326 is seemingly the SRID corresponding to [-90;90]x[-180;180] lat/long coordinate system, verify this assumption
        id = getid("ses")
        print("insert into backend_api_sessions (id, time_begin, time_end, geo_line) values (%d, '%s', '%s', ST_GeomFromText('LINESTRING(%s)', 4326));" % (id, ctime(time), ctime(new_time),
              ", ".join((str(i[0])+" "+str(i[1]) for i in v))))

        # Generate some data
        if data_func:
            # TODO: parametrise the call somehow?
            par_id, chan_id, freq, min_freq, max_freq, raw_doc, end_doc = data_func()
            raw_doc_id = insert_doc(time, raw_doc)
            end_doc_id = insert_doc(time, end_doc)
            # TODO: same doc twice
            insert_measure(id, par_id, chan_id, raw_doc_id, end_doc_id, freq, min_freq, max_freq)

        time = new_time

# TODO: Translations table should to be constrained by ID, but rather by id-langcode pair
def trans(s):
    id = getid("trans")
    print("insert into backend_api_translations (id, langcode, text) values (%d, 'en', '%s');" % (id, s))
    return id

def insert_satellite(time_begin, time_end, name, description): # TODO: name-'s', plural
    name_id = trans(name)
    desc_id = trans(description)
    id = getid("sat")
    print("insert into backend_api_space_projects (id, date_start, date_end, name_id, description_id) values (%d, '%s', '%s', %d, %d);" % (id, dtime(time_begin), dtime(time_end), name_id, desc_id))
    return id
    # TODO: newly created id unused before sessions get the spacecraft id column

def insert_device(name, description, sat_id):
    name_id = trans(name)
    desc_id = trans(description)
    id = getid("dev")
    print("insert into backend_api_devices (id, name_id, description_id, satellite_id) values (%d, %d, %d, %d);" % (id, name_id, desc_id, sat_id ))
    return id

def insert_function(description, func):
    desc_id = trans(description)
    id = getid("func")
    print("insert into backend_api_functions (id, description_id, django_func) values (%d, %d, '%s');" % (id, desc_id, func ))
    return id

def insert_channel(name, description, dev_id, func_id):
    name_id = trans(name)
    desc_id = trans(description)
    id = getid("chan")
    print("insert into backend_api_channels (id, name_id, description_id, device_id, quicklook_id) values (%d, %d, %d, %d, %d);" % (id, name_id, desc_id, dev_id, func_id))
    return id

def insert_unit(symbol, description):
    sym_id = trans(symbol)
    desc_id = trans(description)
    id = getid("unit")
    print("insert into backend_api_units (id, long_name_id, short_name_id) values (%d, %d, %d);" % (id, desc_id, sym_id))
    return id

def insert_value(name, description, short_name, unit_id):
    name_id = trans(name)
    desc_id = trans(description)
    id = getid("val")
    print("insert into backend_api_values (id, name_id, description_id, short_name, units_id) values (%d, %d, %d, '%s', %d);" % (id, name_id, desc_id, short_name, unit_id))
    return id

def insert_param(name, description, val_id, conv_id, conv_par, chan_id, func_id):
    name_id = trans(name)
    desc_id = trans(description)
    id = getid("param")
    print("insert into backend_api_parameters (id, name_id, description_id, value_id, conversion_id, conversion_params, channel_id, quicklook_id) values (%d, %d, %d, %d, %d, '%s', %d, %d);" % (id, name_id, desc_id, val_id, conv_id, conv_par, chan_id, func_id))
    return id

def insert_doc(last_mod, payload):
    id = getid("doc")
    print("insert into backend_api_documents (id, last_mod, json_data) values (%d, '%s', '%s');" % (id, ctime(last_mod), dumps(payload)))
    return id

def insert_measure(ses_id, param_id, chan_id, pdoc_id, cdoc_id, freq, min_freq, max_freq):
    id = getid("measure")
    print("insert into backend_api_measurements (id, session_id, parameter_id, channel_id, chn_doc_id, par_doc_id, sampling_frequency, min_frequency, max_frequency) values (%d, %d, %d, %d, %d, %d, %f, %f, %f); " % (id, ses_id, param_id, chan_id, pdoc_id, cdoc_id, freq, min_freq, max_freq))
    return id

# Seed the PRNG
seed(random_seed)

# Remove everything from premises, order is important not to break key constraints
for i in [ "measurements", "parameters", "documents", "sessions", "channels", "values", "devices", "space_projects", "units", "functions", "translations" ]:
    print("delete from backend_api_%s;" % i)

# TODO: Currently only one is inserted, and assmed to exist
dummy_id = insert_function("Dummy function","nothing()")

love_peace_id = insert_satellite(heart_start, heart_start + (heart_pts+peace_pts+lines_pts*2)/orbit_sec, "Peace&Love","A satellite with exquisite orbit drawing pictures that reiginite your faith in humanity.")
roundabout_id = insert_satellite(round_start, round_start + (round_pts)/orbit_sec, "Roundabout","A satellite that does something similar to a real satellite orbit as hard as it can for many minutes.")

# Yes I know space doesn't work like that
termometer_id = insert_device("Space Termometer", "Fictional device to measure random things.", roundabout_id)
term_read_id = insert_channel("U","Termometer reading", termometer_id, dummy_id)
kelvin_id = insert_unit("°K", "degrees Kelvin")
space_temp_id = insert_value("Space Temperature", "Average temperature of something near the satellite for testing purpose.", "T", kelvin_id)
space_temp_param_id = insert_param("Measured Space Temperature", "What our satellite thinks the temperature is.", space_temp_id, dummy_id, "", term_read_id, dummy_id)

# Ready, steady, go!
insert_orbit(heart_start, heart)
insert_orbit(peace_start, circle)
insert_orbit(lines_start, vline)
insert_orbit(utick_start, uptick)

def gen_space_temp():
    freq = 100
    amps = [ randint(50,100) for i in range(freq*orbit_sec) ]
    return space_temp_param_id, term_read_id, freq, freq, freq, { "mV": [ amps[i]*(2+sin(4*2*pi*i/(freq*orbit_sec))) # pure sine turns to zero too often 
        for i in range(freq*orbit_sec) ] }, { "T": amps }

insert_orbit(round_start, roundabout, gen_space_temp)
