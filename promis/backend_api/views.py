from django.shortcuts import render

# Create your views here.

from backend_api import models
from backend_api import serializer
from django.conf import settings

from rest_framework import generics, filters, viewsets, mixins
from rest_framework.decorators import detail_route, list_route, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from rest_framework.views import APIView

import json
from blueman.Sdp import VIDEO_CONF_GW_SVCLASS_ID

class SessionsViewSet(viewsets.ModelViewSet):
    queryset = models.Sessions.objects.all()
    serializer_class = serializer.SesionsSerializer
    
class TranslationsViewSet(viewsets.ModelViewSet):
    queryset = models.Translations.objects.all()
    serializer_class = serializer.TranslationSerializer
    
class SpaceProjectsViewSet(viewsets.ModelViewSet):
    queryset = models.Space_projects.objects.all()
    serializer_class = serializer.SpaceProjectsSerializer
    
class DevicesViewSet(viewsets.ModelViewSet):
    queryset = models.Devices.objects.all()
    serializer_class = serializer.DevicesSerializer
    
class FunctionsViewSet(viewsets.ModelViewSet):
    queryset = models.Functions.objects.all()
    serializer_class = serializer.FunctionsSerializer
    
class CnannelsViewSet(viewsets.ModelViewSet):
    queryset = models.Channels.objects.all()
    serializer_class = serializer.ChannelsSerializer
    
class UnitsViewSet(viewsets.ModelViewSet):
    queryset = models.Units.objects.all()
    serializer_class = serializer.UnitsSerializer
    
class ValuesViewSet(viewsets.ModelViewSet):
    queryset = models.Values.objects.all()
    serializer_class = serializer.ValuesSerializer
    
class ParametersViewSet(viewsets.ModelViewSet):
    queryset = models.Parameters.objects.all()
    serializer_class = serializer.ParametersSerializer
    
class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = models.Documents.objects.all()
    serializer_class = serializer.DocumentsSerializer
    
class MeasurementsViewSet(viewsets.ModelViewSet):
    queryset = models.Measurements.objects.all()
    serializer_class = serializer.MeasurementsSerializer

    
