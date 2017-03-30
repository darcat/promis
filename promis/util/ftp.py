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
# TODO: elegant way to dance around exceptions?
# TODO: more abstractions?

class FTPChecker(ftplib.FTP):
    """
    Advanced version of ftplib.FTP class with bells and whistles
    """
    
    def __init__(self, rootdir, host, port=0):
        """
        Note usual FTP parameters should go AFTER the custom ones.
        
        rootdir     -- root directory where the project folders (data_ids) reside.
        exceptions  -- searchable object containing folders which should not be seen as data_ids.
        ^-- should be set in the ftp object after creation to avoid mixup of parameters
        """
        self.rootdir = rootdir
        self.exceptions = None
        # TODO: support for authentication
        super().__init__()
        self.connect(host, port)
        
    def __enter__(self):
        super().__enter__()
        self.login()
        self.cwd(self.rootdir)
        return self
    
    # TODO: is it pythonic to have .list() and .open() methods instead?
           
    def xlist(self, regex):
        """Generator returning filenames in current FTP directory matching a regular expression"""
        return (fname for fname in self.nlst() if re.search(regex, fname))
        
    
    def xopen(ftpself, filename):
        """Downloads the file from FTP and presents it as a file StringIO in memory object. "with" interface supported"""
        class _ftp_open(io.StringIO):
            def __init__(self, filename):
                self.filename = filename
                super().__init__()
            
            def __enter__(self):
                ftpself.retrlines("RETR " + self.filename, lambda x: self.write(x + "\n"))
                self.seek(0)
                return super().__enter__()
            
        return _ftp_open(filename)

    def check(self):
        """Yields entries in the current directory as data_ids. Skips ones listed in exceptions."""
        for data_id in self.nlst():
            if not self.exceptions or data_id not in self.exceptions:
                yield data_id
