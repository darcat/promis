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
from rest_framework import renderers
import export

# TODO: we only have one data type for now so this would be enough
# but in future we will probably need to put this inside the data
# class hierarchy so that the renderers depend on the data type


class TextRenderer(renderers.BaseRenderer):
    charset = 'utf8'

    def render(self, data, media_type=None, renderer_context=None):
        table = export.make_table(data['data'], data['timelapse']['start'], data['timelapse']['end'], data['geo_line'])
        value = data['value']['name']
        units = data['value']['units']

        return "\n".join(self.process(table, value, units))

class AsciiRenderer(TextRenderer):
    media_type = 'text/plain'
    format = 'ascii'

    def process(self, table, value, units):
        return export.ascii_export(table, value, units)


class CSVRenderer(TextRenderer):
    media_type = 'text/csv'
    format = 'csv'
    charset = 'utf8'

    def process(self, table, value, units):
        return export.csv_export(table, value, units)
