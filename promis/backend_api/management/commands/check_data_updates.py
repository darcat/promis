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
from django.core.management.base import BaseCommand
import backend_api.models as model
from importlib import import_module
import re

# TODO: put this somewhere others could access
def get_function(path):
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
    f = getattr(module, m.group(2))
    if not f:
        raise ValueError("Can not locate the function: %s." % m.group(2))

    return f


class Command(BaseCommand):
    def handle(self, *args, **options):
        for sat in model.Space_project.objects.iterator():
            # TODO: select a language and print some info
            if sat.data_check and sat.data_fetch:
                check = get_function(sat.data_check.django_func)
                fetch = get_function(sat.data_fetch.django_func)

                for data_id in check(sat):
                    fetch(sat, data_id)
