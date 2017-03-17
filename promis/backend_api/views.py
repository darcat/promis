# -*- coding: utf-8 -*-
from rest_framework.views import APIView
from rest_framework.generics import  GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin

from backend_api import models
from backend_api import serializer

class ProjectsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Space_project.objects.all()
    serializer_class = serializer.SpaceProjectsSerializer


'''    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)
        resp = {'id': None, 'name': None, 'desc': None, 'timelapse': None}

        return Response(resp, status = status.HTTP_200_OK)
''' 


class DevicesView(APIView):
    
    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)
        resp = {'id': None, 'name': None, 'desc': None, 'channels': None}

        return Response(resp, status = status.HTTP_200_OK)
    


class ChannelsView(APIView):
    
    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)
        resp = {'id': None, 'name': None}

        return Response(resp, status = status.HTTP_200_OK)
    


class SessionsView(APIView):
    
    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)
        resp = {'id': None, 'project': None, 'orbit': None, 'geoline': None, 'measurements': None, 'time': None}

        return Response(resp, status = status.HTTP_200_OK)
    


class MeasurementsView(APIView):
    
    def get(self, request, *args, **kwargs):
        # validated request data will be here
        data = kwargs.get('data', None)
        resp = {'url': None}

        return Response(resp, status = status.HTTP_200_OK)
    


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
    

