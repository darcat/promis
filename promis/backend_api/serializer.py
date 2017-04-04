from rest_framework import serializers
from backend_api import models

from rest_framework.fields import ReadOnlyField
from rest_framework.reverse import reverse
from djsw_wrapper.serializers import SwaggerHyperlinkedRelatedField
from hvad.contrib.restframework import TranslatableModelSerializer
from rest_framework_gis.serializers import GeoModelSerializer
from django.contrib.gis.geos import GEOSGeometry, GEOSException
import json

from django.contrib.auth.models import User
from django.contrib.auth.models import Group
import pandas

class SessionsSerializer(serializers.ModelSerializer):
    measurements = SwaggerHyperlinkedRelatedField(many = True, view_name = 'measurement-detail', read_only = True)
    geo_line = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()


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
    channel = SwaggerHyperlinkedRelatedField(many = False, view_name = 'channel-detail', read_only = True)

    class Meta:
        fields = ('id', 'name', 'description', 'channel')
        model = models.Parameter

class DocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Document

'''class QuicklookHyperlink(serializers.HyperlinkedRelatedField):
    view_name = 'document-detail'
    read_only = True
    
    queryset = models.Document.objects.all()
    
    def get_object    
'''  

class MeasurementsSerializer(serializers.ModelSerializer):
    session = SwaggerHyperlinkedRelatedField(many = False, view_name = 'session-detail', read_only = True)
    channel = SwaggerHyperlinkedRelatedField(many = False, view_name = 'channel-detail', read_only = True)
    parameter = SwaggerHyperlinkedRelatedField(many = False, view_name = 'parameter-detail', read_only = True)
    quicklook = serializers.SerializerMethodField()
        
    class Meta:
        fields = ('session', 'parameter', 'channel', 'sampling_frequency', 'min_frequency', 'max_frequency',
                  'quicklook')
        model = models.Measurement
    
    def get_quicklook(self, obj):
        id = obj.chn_doc.id
        return self.context['request'].build_absolute_uri('/en/api/quicklook/' + str(id))
        
        
        
class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
          write_only=True,
    )

    class Meta:
       model = User
       fields = ('password', 'username', 'first_name', 'last_name',)

    def create(self, validated_data):
        user = super(UserSerializer, self).create(validated_data)
        if 'password' in validated_data:
              user.set_password(validated_data['password'])
        
        grp = Group.objects.get(name='level1')
        
        user.groups.add(grp)
        user.save()
              
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super(UserSerializer, self).update(instance, validated_data)
    
class QuickLookSerializer(serializers.ModelSerializer):
    json_data = serializers.SerializerMethodField()
        
    class Meta:
        model = models.Document
        fields = ('json_data',)
        
    def moving_average(self, data, period):
        ret_val = []
        for i in range (period, len(data) - 1):
            ave = 0.0
            for j in range (0, period):
                ave += data[i + j]
                ave /= period
            ret_val.append(ave)
            
    def get_json_data(self, obj):
        values_len = self.context['request'].query_params.get('points', None)
        if values_len is not None:
            try:
                values_len = int(values_len)
            except ValueError:
                values_len = 1000
        if values_len > 1000:
            values_len = 1000
        
        jdata = obj.json_data
        res_data = []
        result = {}
        for key in jdata:
            dlen = len(jdata[key])
            if dlen > values_len:
                wd = int(dlen/values_len)
                result[key] = self.moving_average(jdata[key], values_len)
            else:
                result[key] = jdata[key] 
        
        print (result)
        return result
        