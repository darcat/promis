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

def sign(x):
    """Returns 1 for non-negative arguments and -1 otherwise."""
    return 1 if x>=0 else -1

def rad2deg(x):
    """Converts radians to degrees."""
    return 180*x/math.pi

def cord_conv(RX, RY, RZ):
    """Converts coordinates in ECEF cartesian system to radius, longitude and latitude."""
    # TODO: is rotation included?
    r   = math.sqrt(RX**2 + RY**2 + RZ**2)
    phi = math.pi/2 - math.acos(RZ/r)
    rho = math.acos(RX/(r*math.sin(math.pi/2 - phi))) * sign(RY)
    # Vector from origin, Longitude, Latitude
    return r, rad2deg(rho), rad2deg(phi)
