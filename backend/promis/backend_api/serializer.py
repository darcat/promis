from rest_framework import serializers
from backend_api import models

from rest_framework.fields import ReadOnlyField, SerializerMethodField
from rest_framework.reverse import reverse
from djsw_wrapper.serializers import SwaggerHyperlinkedRelatedField
from hvad.contrib.restframework import TranslatableModelSerializer, HyperlinkedTranslatableModelSerializer
from rest_framework_gis.serializers import GeoModelSerializer
from django.contrib.gis.geos import GEOSGeometry, GEOSException
import json

from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from backend_api import helpers
import util.parsers


class LookupById:
    '''Shortcut to include extra_kwargs to every Meta class'''
    extra_kwargs = { 'url': { 'lookup_field': 'id' } }


class SpaceProjectsSerializer(TranslatableModelSerializer):
    timelapse = serializers.SerializerMethodField()

    def get_timelapse(self, obj):
        # TODO: start and end are a DATE not DATETIME, but we convert them implicitly
        return { 'start': util.parsers.datetime_to_utc(obj.date_start),
                 'end': util.parsers.datetime_to_utc(obj.date_end) }

    class Meta(LookupById):
        model = models.Space_project
        fields = ('id', 'url', 'name', 'description', 'timelapse')


class ChannelsSerializer(TranslatableModelSerializer):
    class Meta(LookupById):
        fields = ('id', 'url', 'name', 'description')
        model = models.Channel


class ParametersSerializer(TranslatableModelSerializer):
    channel = SwaggerHyperlinkedRelatedField(many = False, read_only = True, view_name = 'channel-detail')

    class Meta(LookupById):
        fields = ('id', 'url', 'name', 'description', 'channel')
        model = models.Parameter


class DevicesSerializer(TranslatableModelSerializer):
    space_project = SwaggerHyperlinkedRelatedField(many = False, read_only = True, view_name = 'space_project-detail')
    channels = SwaggerHyperlinkedRelatedField(many = True, read_only = True, view_name = 'channel-detail')

    class Meta(LookupById):
        model = models.Device
        fields = ('id', 'url', 'name', 'description', 'space_project', 'channels')


class SessionsSerializer(serializers.ModelSerializer):
    # TODO: STUB, see #196
    #measurements = SwaggerHyperlinkedRelatedField(many = True, read_only = True, view_name = 'measurement-detail')
    # cut from here:
    measurements = SerializerMethodField()
    def get_measurements(self, obj):
        return (self.context['request'].build_absolute_uri('/api/measurements/' + str(m.id))
                    for m in models.Measurement.objects.filter(session = obj))
    # to here ^

    space_project = SwaggerHyperlinkedRelatedField(many = False, read_only = True, view_name = 'space_project-detail')

    geo_line = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    def get_geo_line(self, obj):
        # Just in case for the future
        #return obj.geo_line.wkb.hex()

        # TODO: study whether pre-building the list or JSON would speed up things
        return util.parsers.wkb(obj.geo_line.wkb) # <- Generator

    def get_time(self, obj):
        # TODO: change to time_start in model for consistency
        return { 'start': util.parsers.datetime_to_utc(obj.time_begin),
                 'end': util.parsers.datetime_to_utc(obj.time_end) }


    class Meta(LookupById):
        model = models.Session
        fields = ('id', 'url', 'space_project', 'orbit_code', 'geo_line', 'time', 'measurements')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # If we are serializing a list of sessions, don't include the geo_line
        if type(args[0]) is list:
            self.fields.pop('geo_line')


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


class MeasurementsSerializer(serializers.ModelSerializer):
    session = SwaggerHyperlinkedRelatedField(many = False, view_name = 'session-detail', read_only = True)
    channel = SwaggerHyperlinkedRelatedField(many = False, view_name = 'channel-detail', read_only = True)
    parameter = SwaggerHyperlinkedRelatedField(many = False, view_name = 'parameter-detail', read_only = True)
    channel_quicklook = serializers.SerializerMethodField()
    channel_download = serializers.SerializerMethodField()
    parameter_quicklook = serializers.SerializerMethodField()
    parameter_download = serializers.SerializerMethodField()


    class Meta(LookupById):
        # TODO: add 'url' here, currently it's broken, see #196
        fields = ('id', 'session', 'parameter', 'channel', 'sampling_frequency', 'min_frequency', 'max_frequency', 'channel_quicklook', 'channel_download', 'parameter_quicklook', 'parameter_download')
        model = models.Measurement

    #TODO: SPIKE: remove below hard code and replace to related view path.
    def construct_data_url(self, obj, source, action):
        id = getattr(obj, source + "_doc").id
        return self.context['request'].build_absolute_uri('/api/%s/%d/%s' % (action, id, source))

    def get_channel_quicklook(self, obj):
        return self.construct_data_url(obj, "channel", "quicklook")
    def get_channel_download(self, obj):
        return self.construct_data_url(obj, "channel", "download")
    def get_parameter_quicklook(self, obj):
        return self.construct_data_url(obj, "parameter", "quicklook")
    def get_parameter_download(self, obj):
        return self.construct_data_url(obj, "parameter", "download")
    # cut here ^

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        user = self.context['request'].user
        if not (helpers.UserInGroup(user, 'level1') or helpers.IsSuperUser(user)):
            self.fields.pop('channel_download')


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
