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
import re
from importlib import import_module

def func_by_path(path):
    """Returns the function identified by its fully qualified path string"""
    # Breaking down to components
    rexp = r"((?:[a-zA-Z_][a-zA-Z0-9_]*\.)*)([a-zA-Z_][a-zA-Z0-9_]*)"
    m = re.search(rexp, path)
    if not m:
        raise ValueError("Invalid function path: %s." % path)

    # Importing the module
    module = import_module(m.group(1)[:-1])
    if not module:
        raise ValueError("Can not import the module: %s" % m.group(1))

    # Looking for the function
    # TODO: this raises an exception if not found see #56
    f = getattr(module, m.group(2))
    if not f:
        raise ValueError("Can not locate the function: %s." % m.group(2))

    return f
