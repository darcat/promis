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
from util.functions import func_by_path

class Command(BaseCommand):
    def handle(self, *args, **options):
        # TODO: pick up the language from locale
        for sat in model.Space_project.objects.language('en'):
            if sat.data_func:
                print("=> Checking data for satellite: %s." % sat.name)
                check, fetch = func_by_path(sat.data_func.django_func)(sat)

                # if check() returns None, iterate an empty tuple i.e. don't do anything
                for data_id in check() or ():
                    if data_id:
                        print("=> Fetching data by id: %s." % data_id)
                        fetch(data_id)
