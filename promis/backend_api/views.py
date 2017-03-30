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
import django_filters

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.pagination import LimitOffsetPagination
from django.contrib.gis.geos import GEOSGeometry, GEOSException 
#import ValueError

class SessionFilter(django_filters.rest_framework.FilterSet):
    time_begin = django_filters.IsoDateTimeFilter(lookup_expr='gte')
    time_end = django_filters.IsoDateTimeFilter(lookup_expr='lte')
    
    class Meta:
        model = models.Session
        fields = ['satellite', 'time_begin', 'time_end']
    
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
    filter_backends = (DjangoFilterBackend,)
    filter_class = SessionFilter
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        queryset = models.Session.objects.all()
        polygon = self.request.query_params.get('polygon', None)
        if polygon is not None:
            try:
                geoobj = GEOSGeometry(polygon, srid = 4326)
            
                if geoobj.valid:
                    objs = []
                    for obj in queryset:
                        geoline = obj.geo_line
                        if geoobj.crosses(geoline):
                            objs.append(obj.id)
                        
                    queryset = models.Session.objects.filter(pk__in = objs)
                
                return queryset
            
            except ValueError:
                pass
            
            except GEOSException:
                pass
            
            
            
            return models.Session.objects.none()
        
        return queryset

class ParametersView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Parameter.objects.all()
    serializer_class = serializer.ParametersSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('channel',)

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
    

