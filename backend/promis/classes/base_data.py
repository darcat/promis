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
'''Base functionality for object-oriented data model'''

import unix_time

class BaseData:
    '''
    Derived classes are expected to implement:
    - self.__len__          -- for sample size
    - self.__getitem___     -- for data access
    - self.data_start       -- UNIX timestamp
    - self.frequency        -- sampling frequency
    '''
    def __init__(self, doc, source, measurement):
        self.doc = doc
        self.source = source
        self.measurement = measurement

    def data_start(self):
        return unix_time.datetime_to_utc(self.measurement.session.time_begin)

    def frequency(self):
        return self.measurement.sampling_frequency

    def timeslice(self, start, end):
        '''
        Returns a slice for accessing data between start and end inclusively.
        start and end are UNIX seconds at UTC.
        '''
        data_end = self.data_start() + len(self) // self.frequency()

        # Check for open bounds
        if end is None:
            end = data_end
        if start is None:
            start = self.data_start()

        if start < self.data_start() or end > data_end:
            raise IndexError

        # Shifting the bounds
        start -= self.data_start()
        end -= self.data_start()

        # Converting time to samples
        start *= self.frequency()
        end *= self.frequency()

        return slice(int(start),int(end))


# TODO: expand the scope to include multiple variables
class SingleVarTimeSeries(BaseData):
    '''
    [en]: Repeated measurement of a single variable
    [uk]: Періодичне вимірювання єдиної змінної
    '''

    # Underlying document is a simple list
    # delegate sequence protocol there
    def __len__(self):
        return len(self.doc)

    def __getitem__(self, idx):
        return self.doc[idx]

    def data(self, selection = slice(None)):
        return self.doc[selection]

    # TODO: propagate upwards?
    def quicklook(self, points, selection = slice(None)):
        '''
        Generates a quicklook of the time series object sampled at
        given number of points.
        '''

        def avg_float(l, n, span):
            '''
            Computes an average of span elements of the iterable l starting from n.

            span may be a float, in such case, the next element is
            summed, multiplied by the remainder span - int(span).

            TODO: maybe this needs to be rethinked somehow.
            '''
            # Integer part of the sum
            s = sum(l[n:n+int(span)])

            # The rest
            ratio = span - int(span)
            if ratio > 0.00001:
                s += l[n + int(span)] * ratio

            return s / span

        v = self.data(selection)

        # If given too much points, return the original data
        # TODO: make configurable somewhere
        # TODO: maybe depend on the user's level?
        max_points = int(0.3 * len(v))
        if points > max_points:
            points = max_points

        # If the above gets us with zero, return None
        # This makes sense as it prevents the user from loading
        # all the data by querying 1 sec quicklooks
        if points <= 0:
            return

        # Determining how many points are averaged
        span = len(v) / points

        for i in range(points):
            yield avg_float(v, int(span * i), span)
