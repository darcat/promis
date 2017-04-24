from rest_framework import serializers
from backend_api import models

from rest_framework.fields import ReadOnlyField, SerializerMethodField
from rest_framework.reverse import reverse
from djsw_wrapper.serializers import SwaggerHyperlinkedRelatedField
from hvad.contrib.restframework import TranslatableModelSerializer
from rest_framework_gis.serializers import GeoModelSerializer
from django.contrib.gis.geos import GEOSGeometry, GEOSException
import json

from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from backend_api import helpers
import util.parsers


class SessionsSerializer(serializers.ModelSerializer):
#   TODO: Spike! @lyssdod, correct this
#    measurements = SwaggerHyperlinkedRelatedField(many = True, view_name = 'measurement-detail', read_only = True)
    measurements = SerializerMethodField()

    geo_line = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

#   TODO: Spike! @lyssdod, correct this
    def get_measurements(self, obj):
        meas = models.Measurement.objects.filter(session = obj)
        #TODO: SPIKE: remove below hard code and replace to related view path.
        ret_val = []
        for m in meas:
            ret_val.append(self.context['request'].build_absolute_uri('/en/api/measurements/' + str(m.id)))

        return ret_val


    def get_geo_line(self, obj):
        # Just in case for the future
        #return obj.geo_line.wkb.hex()

        # TODO: study whether pre-building the list or JSON would speed up things
        return util.parsers.wkb(obj.geo_line.wkb) # <- Generator

    def get_time(self, obj):
        ret_val = {}
        ret_val['begin'] = str(obj.time_begin.isoformat())
        ret_val['end'] = str(obj.time_end.isoformat())

        return ret_val


    class Meta:
        model = models.Session
        fields = ('id', 'space_project', 'orbit_code', 'geo_line', 'time', 'measurements')
        geo_field = 'geo_line'

# TODO: merge with the class above
class CompactSessionsSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()

    def get_geo_line(self, obj):
        return util.parsers.wkb(obj.geo_line.wkb)
    def get_time(self, obj):
        return { 'begin': obj.time_begin.isoformat(),
                 'end': obj.time_end.isoformat() }

    def __init__(self, *args, need_geo_line=True, **kwargs):
        super().__init__(*args, **kwargs)
        if need_geo_line:
            self.fields.update({ "geo_line": serializers.SerializerMethodField() })

    class Meta:
        model = models.Session
        fields = ('time',)

class SpaceProjectsSerializer(TranslatableModelSerializer):
    timelapse = serializers.SerializerMethodField()

    def get_timelapse(self, obj):
        ret_val = {}
        ret_val['begin'] = str(obj.date_start.isoformat())
        ret_val['end'] = str(obj.date_end.isoformat())

        return ret_val

    class Meta:
        model = models.Space_project
        fields = ('id', 'name', 'description', 'timelapse')

class ChannelsSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('id', 'name', 'description',)
        model = models.Channel

class DevicesSerializer(TranslatableModelSerializer):
    satellite = SpaceProjectsSerializer(many = False)
    channels = ChannelsSerializer(many = True)

    class Meta:
        model = models.Device
        fields = ('id', 'name', 'description', 'satellite', 'channels')

class FunctionsSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Function

class UnitsSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Unit

class ValuesSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Value

class ParametersSerializer(TranslatableModelSerializer):
# TODO: fix the bug
#    channel = HyperlinkedRelatedField(many = False, view_name = 'channel-detail', read_only = True)
    channel = ChannelsSerializer()
    class Meta:
        fields = ('id', 'name', 'description', 'channel')
        model = models.Parameter


'''class QuicklookHyperlink(serializers.HyperlinkedRelatedField):
    view_name = 'document-detail'
    read_only = True

    queryset = models.Document.objects.all()

    def get_object
'''

def _context_function_call(self, *args):
    '''
    Takes the function stored as self.context['func'] and calls it passing
    args as positional arguments and self.context['kwargs'] as keyword arguments
    '''
    return self.context['func'] (*args, **self.context['kwargs'])

class AbstractMeasurementSerializer(serializers.ModelSerializer):
    '''
    Abstract base class for measurement serializers that include either the
    channel or the parameter definition and do some work on the document.

    Required stuff in context dictionary:
    * 'source': the measurement field name where the data comes from.
      Document attribute name is constructed  as {source}_doc.
    * 'serializer': serializer class to serialize source with.
    '''
    data = serializers.SerializerMethodField()
    session = serializers.SerializerMethodField()
    class Meta:
        model = models.Measurement
        fields = ('data', 'session')

    def __init__(self, *args, **kwargs):
        '''Adds an extra source field on construction'''
        super().__init__(*args, **kwargs)
        self.fields.update({self.context['source']: self.context['serializer']()})

    def get_data(self, obj):
        '''
        Serializes data to JSON. Define the following callback in your derived classes:

        def prepare_data(self, obj, doc, source)
        '''
        src = self.context['source']
        return self.prepare_data(obj, getattr(obj, src + '_doc'), getattr(obj, src))

    def get_session(self, obj):
        return CompactSessionsSerializer(obj.session, need_geo_line = self.context.get('need_geo_line', True)).data

class QuickLookSerializer(AbstractMeasurementSerializer):
    '''Calls the quicklook on the JSON data and returns the result'''
    def prepare_data(self, obj, doc, source):
        return _context_function_call(self, doc.json_data)

class JSONDataSerializer(AbstractMeasurementSerializer):
    '''Serializes the document (channel or parameter) into rich JSON form'''
    def prepare_data(self, obj, doc, source):
        return doc.json_data

# TODO: this pulls unnecessary fields in
class ExportDataSerializer(AbstractMeasurementSerializer):
    '''Uses the channel/parameter export function to serialize the document'''
    def prepare_data(self, obj, doc, source):
        return _context_function_call(self, doc.json_data, obj.session)

# TODO: move somewhere else
from rest_framework import renderers
class PlainTextRenderer:
    media_type = 'text/plain'
    format = 'ascii'
    charset = 'utf8'

    def render(self, data, media_type=None, renderer_context=None):
        return "\n".join(data)

#TODO: class below need some refactoring.....
class DownloadViewSerializer(serializers.ModelSerializer):
    chn_quicklook = serializers.SerializerMethodField()
    par_quicklook = serializers.SerializerMethodField()

    channel_docn_doc = serializers.SerializerMethodField()
    parameter_doc = serializers.SerializerMethodField()

    class Meta:
        fields = ('chn_quicklook', 'par_quicklook', 'channel_doc', 'parameter_doc')
        model = models.Measurement

    def get_chn_quicklook(self, obj):
        id = obj.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/quicklook/' + str(id) + '/channel')

    def get_par_quicklook(self, obj):
        id = obj.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/quicklook/' + str(id) + '/parameter')

    def get_channel_doc(self, obj):
        id = obj.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/download/' + str(id) + '/channel')

    def get_parameter_doc(self, obj):
        id = obj.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/download/' + str(id) + '/parameter')

    def __init__(self, *args, **kwargs):

        super().__init__(*args, **kwargs)

        user = self.context['request'].user
        if not (helpers.UserInGroup(user, 'level1') or helpers.IsSuperUser(user)):
            self.fields.pop('chn_doc')
            self.fields.pop('chn_quicklook')

class MeasurementsSerializer(serializers.ModelSerializer):
    session = SwaggerHyperlinkedRelatedField(many = False, view_name = 'session-detail', read_only = True)
    channel = SwaggerHyperlinkedRelatedField(many = False, view_name = 'channel-detail', read_only = True)
    parameter = SwaggerHyperlinkedRelatedField(many = False, view_name = 'parameter-detail', read_only = True)
    data = serializers.SerializerMethodField()


    class Meta:
        fields = ('session', 'parameter', 'channel', 'sampling_frequency', 'min_frequency', 'max_frequency', 'data')
        model = models.Measurement

    def get_data(self, obj):
        id = obj.chn_doc.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/download/' + str(id))

    def __init__(self, *args, **kwargs):

        super().__init__(*args, **kwargs)


        user = self.context['request'].user

        if not (helpers.UserInGroup(user, 'level1') or helpers.IsSuperUser(user)):
            self.fields.pop('channel')


class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
          write_only=True,
    )

    date_joined = serializers.DateTimeField(read_only = True)
    last_login = serializers.DateTimeField(read_only = True)

    class Meta:
       model = User
       fields = ('password', 'username', 'first_name', 'last_name', 'date_joined', 'last_login')

    def create(self, validated_data):
        user = super().create(validated_data)
        if 'password' in validated_data:
              user.set_password(validated_data['password'])

        user.save()

        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super().update(instance, validated_data)
