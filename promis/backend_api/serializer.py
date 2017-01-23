from rest_framework import serializers
from backend_api import models

from rest_framework.fields import ReadOnlyField
from rest_framework.relations import PrimaryKeyRelatedField, SlugRelatedField

class SessionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Sessions
        fields = ('__all__')
        
class TranslationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Translations
        fields = ('__all__')

class SpaceProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Space_projects
        fields = ('__all__')
        
class DevicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Devices
        fields = ('__all__')
        
class FunctionsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Functions
        
class ChannelsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Channels
        
class UnitsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Units
        
class ValuesSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Values
        
class ParametersSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Parameters
        
class DocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Documents

class MeasurementsSerializers(serializers.ModelSerializer):
    class Meta:
        fields = ('__all__')
        model = models.Measurements
