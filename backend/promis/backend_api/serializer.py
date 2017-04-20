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
        fields = ('id', 'satellite', 'orbit_code', 'geo_line', 'time', 'measurements')
        geo_field = 'geo_line'

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

class DocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Document

class QuickLookSerializer(serializers.ModelSerializer):
    json_data = serializers.SerializerMethodField()

    class Meta:
        model = models.Document
        fields = ('json_data',)

    def get_json_data(self, obj):
        # Only calling the quicklook callback passed in the context
        # TODO: standardise the npoints param in the docs
        return self.context['quicklook_fun'](obj.json_data, npoints = self.context['npoints'])

class ChannelQuicklookSerializer(serializers.ModelSerializer):
    channel = ChannelsSerializer()
    chn_doc = serializers.SerializerMethodField()

    class Meta:
        fields = ('channel', 'chn_doc')
        model = models.Measurement

    def get_chn_doc(self, obj):
        context = self.context
        context['channel'] = obj.channel
        ser = QuickLookSerializer(obj.chn_doc, context = context)

        return(ser.data)

class ParameterQuicklookSerializer(serializers.ModelSerializer):
    parameter = ParametersSerializer()
    par_doc = serializers.SerializerMethodField()

    class Meta:
        fields = ('parameter', 'par_doc')
        model = models.Measurement

    def get_par_doc(self, obj):
        context = self.context
        context['parameter'] = obj.parameter
        ser = QuickLookSerializer(obj.par_doc, context = context)

        return(ser.data)


class ChannelDataSerializer(serializers.ModelSerializer):
    channel = ChannelsSerializer()
    chn_doc = DocumentsSerializer()

    class Meta:
        fields = ('channel', 'chn_doc')
        model = models.Measurement

class ParameterDataSerializer(serializers.ModelSerializer):
    parameter = ParametersSerializer()
    par_doc = DocumentsSerializer()

    class Meta:
        fields = ('parameter', 'par_doc')
        model = models.Measurement

#TODO: class below need some refactoring.....
class DownloadViewSerializer(serializers.ModelSerializer):
    chn_quicklook = serializers.SerializerMethodField()
    par_quicklook = serializers.SerializerMethodField()

    chn_doc = serializers.SerializerMethodField()
    par_doc = serializers.SerializerMethodField()

    class Meta:
        fields = ('chn_quicklook', 'par_quicklook', 'chn_doc', 'par_doc')
        model = models.Measurement

    def get_chn_quicklook(self, obj):
        id = obj.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/quicklook/' + str(id) + '/channel')

    def get_par_quicklook(self, obj):
        id = obj.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/quicklook/' + str(id) + '/parameter')

    def get_chn_doc(self, obj):
        id = obj.id
        #TODO: SPIKE: remove below hard code and replace to related view path.
        return self.context['request'].build_absolute_uri('/en/api/download/' + str(id) + '/channel')

    def get_par_doc(self, obj):
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

    class Meta:
       model = User
       fields = ('password', 'username', 'first_name', 'last_name',)

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
