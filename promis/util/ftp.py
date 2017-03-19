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
"""FTP utilities for the common operations in the project"""

import ftplib
import re, io

# TODO: class-oriented approach instead of functions? See: #52
# TODO: currently both high-level check and fetch must instantiate their own object
# TODO: make "list only files" and "list only dirs" stuff

class FTPChecker(ftplib.FTP):
    """
    Advanced version of ftplib.FTP class with bells and whistles
    """
    
    def __init__(self, rootdir, exceptions=None, *args, **kwargs):
        """
        Note usual FTP parameters should go AFTER the custom ones.
        
        rootdir     -- root directory where the project folders (data_ids) reside.
        exceptions  -- searchable object containing folders which should not be seen as data_ids.
        """
        self.rootdir = rootdir
        self.exceptions = exceptions
        super().__init__(*args, **kwargs)
        
    def __enter__(self):
        super().__enter__()
        self.login()
        self.cwd(self.rootdir)
        return self
           
    def list(self, regex):
        """Generator returning filenames in current FTP directory matching a regular expression"""
        return (fname for fname in self.nlst() if re.search(regex, fname))
        
    def check(self):
        """Yields entries in the current directory as data_ids. Skips ones listed in exceptions."""
        for data_id in self.nlst():
            if not self.exceptions or data_id not in self.exceptions:
                yield data_id

        
    
    
    
