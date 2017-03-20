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

import util.ftp, util.files
# TODO: yield/with problem, see potential.py for details

def roundabout(satellite_object):
    """
    [en]: Test set FTP data collection service (roundabout)
    [uk]: Сервіс забору тестових даних з FTP (roundabout)
    """
    def check():
        with util.ftp.FTPChecker("roundabout/", "localhost", 2121) as ftp:
            for v in ftp.check():
                yield v
    
    def fetch(data_id):
        pass
    
    return check, fetch


def peace_love(satellite_object):
    """
    [en]: Test set FTP data collection service (peace & love)
    [uk]: Сервіс забору тестових даних з FTP (peace & love)
    """
    def check():
        with util.ftp.FTPChecker("peace_love/", "localhost", 2121) as ftp:
            for v in ftp.check():
                yield v
    
    def fetch(data_id):
        pass
    
    return check, fetch
