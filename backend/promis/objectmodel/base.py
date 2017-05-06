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
"""Base functionality for object-oriented data model"""

class AbstractTimeSeries:
    """
    Derived classes are expected to implement:
    - self.__len__          -- for sample size
    - self.__getitem___     -- for data access
    - self.data_start       -- UNIX timestamp
    - self.frequency        -- sampling frequency
    """

    def timeslice(self, start, end):
        """
        Yields data between start and end inclusively.
        start and end are UNIX seconds at UTC.
        """
        data_end = self.data_start + len(self) // self.frequency
        if start < self.data_start or end > data_end:
            raise IndexError

        # Shifting the bounds
        start -= self.data_start
        end -= self.data_start

        # Converting time to samples
        start *= self.frequency
        end *= self.frequency

        return self[start:end]

    def quicklook(self):




