from rest_framework import serializers
from backend_api import models

from rest_framework.fields import ReadOnlyField
from rest_framework.relations import PrimaryKeyRelatedField, SlugRelatedField
from hvad.contrib.restframework import TranslatableModelSerializer

class SessionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Session
        fields = ('__all__')

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
        
class DevicesSerializer(TranslatableModelSerializer):
    class Meta:
        model = models.Device
        fields = ('__all__')
        
class FunctionsSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Function
        
class ChannelsSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Channel
        
class UnitsSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Unit
        
class ValuesSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Value
        
class ParametersSerializer(TranslatableModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Parameter
        
class DocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Document

class MeasurementsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Measurement
