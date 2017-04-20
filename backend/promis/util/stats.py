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
"""Statistical utilities"""

def avg_float(l, n, span):
    """
    Computes an average of span elements of the list l starting from n.

    span may be a float, in such case, the next element is
    summed, multiplied by the remainder span - int(span).

    TODO: maybe this needs to be rethinked somehow.
    """
    # Integer part of the sum
    s = sum(l[n:n+int(span)])

    # The rest
    ratio = span - int(span)
    if ratio > 0.00001:
        s += l[n + int(span)] * ratio

        return s / span

# NOTE: that depends on what quicklooks mean for other data types
def general_quick_look(v, npoints):
    """
    Averages the iterable v into an array of npoints
    """
    # Determining how many points are averaged
    span = len(v) / npoints

    return (avg_float(v, int(span * i), span) for i in range(npoints))
