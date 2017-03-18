# -*- coding: utf-8 -*-

from rest_framework.views import APIView
from rest_framework.generics import  GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
from rest_framework import filters
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin

from backend_api import models
from backend_api import serializer

from django_filters.rest_framework import DjangoFilterBackend

class ProjectsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Space_project.objects.all()
    serializer_class = serializer.SpaceProjectsSerializer

class DevicesView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Device.objects.all()
    serializer_class = serializer.DevicesSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('satellite',)
    
class ChannelsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Channel.objects.all()
    serializer_class = serializer.ChannelsSerializer
    
class SessionsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Session.objects.all()
    serializer_class = serializer.SessionsSerializer    

class MeasurementsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Measurement.objects.all()
    serializer_class = serializer.MeasurementsSerializer    
    


class QuicklookView(APIView):
    
    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)

        return Response(status = status.HTTP_200_OK)
    


class DownloadView(APIView):
    
    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)

        return Response(status = status.HTTP_200_OK)
    


class DownloadData(APIView):
    
    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)

        return Response(status = status.HTTP_200_OK)
    

