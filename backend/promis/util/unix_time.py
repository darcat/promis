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
"""Useful utilities for converting UNIX timestamps back and forth"""

import datetime
import pytz

def datetime_to_utc(x):
    # Add the 00:00 time if we only got a date
    if type(x) is datetime.date:
        x = datetime.datetime.combine(x, datetime.datetime.min.time())
    return int(x.replace(tzinfo=pytz.timezone("UTC")).timestamp())

def str_to_utc(x):
    time_fmt = "%Y{0}%m{0}%d %H:%M:%S".format(x[4])
    return datetime_to_utc(datetime.datetime.strptime(x, time_fmt))

def maketime(u):
    return datetime.datetime.fromtimestamp(u, tz=pytz.utc)
