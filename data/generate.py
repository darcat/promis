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
round_turns = 30

# Meridian speed, something like degrees per latitudal revolution
round_shift = 272 # not multiple of 90

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
    return (x+180)%360-180 if x > 180 else x

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
    return [ [ clamp180(round_shift*t/pi), 80*sin(t) ]
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
        print("insert into sessions (id, time_begin, time_end, geo_line) values (%d, '%s', '%s', ST_GeomFromText('LINESTRING(%s)', 4326));" % (id, ctime(time), ctime(new_time),
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
        
langs = ( 'en', 'uk' )

def insert_satellite(time_begin, time_end, names, descriptions):
    id = getid("sat")
    print("insert into space_projects (id, date_start, date_end) values (%d, '%s', '%s');" % (id, dtime(time_begin), dtime(time_end)))
    for i in range(2):
        print("insert into space_projects_translation (name, description, language_code, master_id) values ('%s', '%s', '%s', %d);" % (names[i], descriptions[i], langs[i], id))
    return id
    # TODO: newly created id unused before sessions get the spacecraft id column

def insert_device(names, descriptions, sat_id):
    id = getid("dev")
    print("insert into devices (id, satellite_id) values (%d, %d);" % (id, sat_id ))
    for i in range(2):
        print("insert into devices_translation (name, description, language_code, master_id) values ('%s', '%s', '%s', %d);" % (names[i], descriptions[i], langs[i], id))
    return id

def insert_function(descriptions, func):
    id = getid("func")
    print("insert into functions (id, django_func) values (%d, '%s');" % (id, func ))
    for i in range(2):
        print("insert into functions_translation (description, language_code, master_id) values ('%s', '%s', %d);" % (descriptions[i], langs[i], id))
    return id

def insert_channel(names, descriptions, dev_id, func_id):
    id = getid("chan")
    print("insert into channels (id, device_id, quicklook_id) values (%d, %d, %d);" % (id, dev_id, func_id))
    for i in range(2):
        print("insert into channels_translation (name, description, language_code, master_id) values ('%s', '%s', '%s', %d);" % (names[i], descriptions[i], langs[i], id))
    return id

def insert_unit(symbols, descriptions):
    id = getid("unit")
    print("insert into units (id) values (%d);" % (id))
    for i in range(2):
        print("insert into units_translation (short_name, long_name, language_code, master_id) values ('%s', '%s', '%s', %d);" % (symbols[i], descriptions[i], langs[i], id))
    return id

def insert_value(names, descriptions, short_name, unit_id):
    id = getid("val")
    print("insert into values (id, short_name, units_id) values (%d, '%s', %d);" % (id, short_name, unit_id))
    for i in range(2):
        print("insert into values_translation (name, description, language_code, master_id) values ('%s', '%s', '%s', %d);" % (names[i], descriptions[i], langs[i], id))
    return id

def insert_param(names, descriptions, val_id, conv_id, conv_par, chan_id, func_id):
    id = getid("param")
    print("insert into parameters (id, value_id, conversion_id, conversion_params, channel_id, quicklook_id) values (%d, %d, %d, '%s', %d, %d);" % (id, val_id, conv_id, conv_par, chan_id, func_id))
    for i in range(2):
        print("insert into parameters_translation (name, description, language_code, master_id) values ('%s', '%s', '%s', %d);" % (names[i], descriptions[i], langs[i], id))

    return id

def insert_doc(last_mod, payload):
    id = getid("doc")
    print("insert into documents (id, last_mod, json_data) values (%d, '%s', '%s');" % (id, ctime(last_mod), dumps(payload)))
    return id

def insert_measure(ses_id, param_id, chan_id, pdoc_id, cdoc_id, freq, min_freq, max_freq):
    id = getid("measure")
    print("insert into measurements (id, session_id, parameter_id, channel_id, chn_doc_id, par_doc_id, sampling_frequency, min_frequency, max_frequency) values (%d, %d, %d, %d, %d, %d, %f, %f, %f); " % (id, ses_id, param_id, chan_id, pdoc_id, cdoc_id, freq, min_freq, max_freq))
    return id

# Seed the PRNG
seed(random_seed)

# Remove everything from premises, order is important not to break key constraints
for i in [ "measurements", "parameters_translation", "parameters", "documents", "sessions", "channels_translation", "channels", "values_translation", "values", "devices_translation", "devices", "space_projects_translation", "space_projects", "units_translation", "units", "functions_translation", "functions" ]:
    print("delete from %s;" % i)

# TODO: Currently only one is inserted, and assmed to exist
dummy_id = insert_function(["Dummy function","Порожня функція"],"none")

love_peace_id = insert_satellite(heart_start, heart_start + (heart_pts+peace_pts+lines_pts*2)/orbit_sec, ["Peace&Love","Мир та Любов"],["A satellite with exquisite orbit drawing pictures that reiginite your faith in humanity.", "Супутник із вишуканою орбітою, що відтворює малюнки, які повернуть вам віру у людство."])
roundabout_id = insert_satellite(round_start, round_start + (round_pts)/orbit_sec, [ "Roundabout", "Колобіг" ], [ "A satellite that does something similar to a real satellite orbit as hard as it can for many minutes.", "Супутник, який з усих сил витворяє щось подібне до реальних супутників багато хвилин." ] )

# Yes I know space doesn't work like that
termometer_id = insert_device([ "Space Termometer", "Космічний Термометр" ], [ "Fictional device to measure random things.", "Видуманий пристрій який міряє випадкові речі" ], roundabout_id)
term_read_id = insert_channel(["U","U"], [ "Termometer reading", "Покази термометру" ], termometer_id, dummy_id)
kelvin_id = insert_unit(["°K", "°K"], [ "degrees Kelvin", "градуси Келвіна"])
space_temp_id = insert_value([ "Space Temperature", "Космічна Температура" ], [ "Average temperature of something near the satellite for testing purpose.", "Середня температура чогось біля супутнику задля перевірки" ], "T", kelvin_id)
space_temp_param_id = insert_param( [ "Measured Space Temperature", "Виміри Космічної Температури" ], [ "What our satellite thinks the temperature is.", "Що наш супутник думає з приводу температури" ], space_temp_id, dummy_id, "", term_read_id, dummy_id)

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
