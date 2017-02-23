from rest_framework import serializers
from backend_api import models

from rest_framework.fields import ReadOnlyField
from rest_framework.relations import PrimaryKeyRelatedField, SlugRelatedField

class SessionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Session
        fields = ('__all__')
        
class TranslationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Translation
        fields = ('__all__')

class SpaceProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Space_project
        fields = ('__all__')
        
class DevicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Device
        fields = ('__all__')
        
class FunctionsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Function
        
class ChannelsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Channel
        
class UnitsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Unit
        
class ValuesSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Value
        
class ParametersSerializer(serializers.ModelSerializer):
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
