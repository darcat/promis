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
from importlib import import_module

def get_func_by_name(path):
    """Returns the function identified by its fully qualified path string"""
    # Breaking down to components
    path_comp = path.rsplit(sep=".", maxsplit=1)

    # Importing the module
    module = import_module(path_comp[0])
    if not module:
        raise ValueError("Can not import the module: %s." % path_comp[0])

    # Looking for the function
    # TODO: this raises an exception if not found see #56
    f = getattr(module, path_comp[1])
    if not f:
        raise ValueError("Can not locate the function: %s." % path_comp[1])

    return f
