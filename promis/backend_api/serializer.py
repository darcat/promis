from rest_framework import serializers
from backend_api import models

from rest_framework.fields import ReadOnlyField
from rest_framework.relations import PrimaryKeyRelatedField, SlugRelatedField
from rest_framework.relations import HyperlinkedRelatedField
from hvad.contrib.restframework import TranslatableModelSerializer
from rest_framework_gis.serializers import GeoModelSerializer
from django.contrib.gis.geos import GEOSGeometry, GEOSException
import json

class SessionsSerializer(serializers.ModelSerializer):
    measurements = serializers.HyperlinkedRelatedField(many = True,
                                                       lookup_url_kwarg='id',
                                                       view_name = 'measurement-detail',
                                                       read_only = True)
    
    time = serializers.SerializerMethodField()
           
    geo_line = serializers.SerializerMethodField()
    
    def get_geo_line(self, obj):
        gl = json.loads(GEOSGeometry(obj.geo_line).json)        
        return gl
    
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
    channel = serializers.HyperlinkedRelatedField(many = False,
                                                       view_name = 'channel-detail',
                                                       read_only = True)
        
    class Meta:
        fields = ('id', 'name', 'description', 'channel')
        model = models.Parameter
        
class DocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Document

class MeasurementsSerializer(serializers.ModelSerializer):
    session = serializers.HyperlinkedRelatedField(many = False,
                                                       view_name = 'session-detail',
                                                       read_only = True)
    
    parameter = serializers.HyperlinkedRelatedField(many = False,
                                                       view_name = 'parameter-detail',
                                                       read_only = True)
    
    channel = serializers.HyperlinkedRelatedField(many = False,
                                                       view_name = 'channel-detail',
                                                       read_only = True)
    
    
    class Meta:
        fields = ('session', 'parameter', 'channel', 'sampling_frequency', 'min_frequency', 'max_frequency')
        model = models.Measurement
