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

import functions
import backend_api.models as model

from pkgutil import walk_packages
from importlib import import_module
from inspect import getmembers, isfunction

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Iterating over the modules in "functions" package
        for _, modname, _ in walk_packages(path=functions.__path__, prefix=functions.__name__+'.'):
            # Picking up functions which have docstrings from the module
            for f in (o for o in getmembers(import_module(modname)) if isfunction(o[1]) and o[1].__doc__):
                fname = "%s.%s" % (modname, f[0])
                
                # Only adding a new object if there is nothing like that in the database
                if model.Function.objects.filter(django_func=fname).count() == 0:
                    print("=> New function: '%s'" % fname)
                    # TODO: better flexibility at the division between the languages
                    # i.e. smth like """en: English description uk: Український опис"""
                    descs = [ desc.strip() for desc in f[1].__doc__.split("===") ]
                    
                    # Creating an English version
                    obj = model.Function.objects.language('en').create(django_func = fname, description = descs[0])
                    # Adding an Ukrainian translation
                    obj.translate('uk')
                    obj.description = descs[1]
                    obj.save()
