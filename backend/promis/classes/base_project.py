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

class BaseProject:
    '''
    Base class for Space Projects.

    Derived classes are supposed to implement:
    TODO: docu
    '''

    def __init__(self, project):
        self.project_obj = project


    def update(self):
        '''Check if new updates exist and apply them if necessary'''

        # if check() returns None, iterate an empty tuple i.e. don't do anything
        for data_id in self.check() or ():
            if data_id:
                print("=> Fetching data by id: %s." % data_id)
                self.fetch(data_id)
