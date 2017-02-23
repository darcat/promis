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

class SessionsViewSet(viewsets.ModelViewSet):
    queryset = models.Session.objects.all()
    serializer_class = serializer.SessionsSerializer
    
class TranslationsViewSet(viewsets.ModelViewSet):
    queryset = models.Translation.objects.all()
    serializer_class = serializer.TranslationsSerializer
    
class SpaceProjectsViewSet(viewsets.ModelViewSet):
    queryset = models.Space_project.objects.all()
    serializer_class = serializer.SpaceProjectsSerializer
    
class DevicesViewSet(viewsets.ModelViewSet):
    queryset = models.Device.objects.all()
    serializer_class = serializer.DevicesSerializer
    
class FunctionsViewSet(viewsets.ModelViewSet):
    queryset = models.Function.objects.all()
    serializer_class = serializer.FunctionsSerializer
    
class ChannelsViewSet(viewsets.ModelViewSet):
    queryset = models.Channel.objects.all()
    serializer_class = serializer.ChannelsSerializer
    
class UnitsViewSet(viewsets.ModelViewSet):
    queryset = models.Unit.objects.all()
    serializer_class = serializer.UnitsSerializer
    
class ValuesViewSet(viewsets.ModelViewSet):
    queryset = models.Value.objects.all()
    serializer_class = serializer.ValuesSerializer
    
class ParametersViewSet(viewsets.ModelViewSet):
    queryset = models.Parameter.objects.all()
    serializer_class = serializer.ParametersSerializer
    
class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = models.Document.objects.all()
    serializer_class = serializer.DocumentsSerializer
    
class MeasurementsViewSet(viewsets.ModelViewSet):
    queryset = models.Measurement.objects.all()
    serializer_class = serializer.MeasurementsSerializer
    