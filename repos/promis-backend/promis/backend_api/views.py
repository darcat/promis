# -*- coding: utf-8 -*-

from rest_framework.views import APIView
from rest_framework.generics import  GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
from rest_framework import filters
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin

from backend_api import models
from backend_api import serializer, helpers
from backend_api.permission import PromisPermission

import django_filters

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.pagination import LimitOffsetPagination
from django.contrib.gis.geos import GEOSGeometry, GEOSException

from django.contrib.auth import get_user_model

from rest_framework.permissions import AllowAny, IsAuthenticated


import datetime
from rest_framework.decorators import permission_classes

class SessionFilter(django_filters.rest_framework.FilterSet):
    time_begin = django_filters.IsoDateTimeFilter(lookup_expr='gte')
    time_end = django_filters.IsoDateTimeFilter(lookup_expr='lte')

    class Meta:
        model = models.Session
        fields = ['satellite', 'time_begin', 'time_end']
        
class MeasurementsFilter(django_filters.rest_framework.FilterSet):
        
    class Meta:
        model = models.Measurement
        fields = ['session', 'parameter']

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
    permission_classes = (PromisPermission,)

class SessionsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Session.objects.all()
    serializer_class = serializer.SessionsSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_class = SessionFilter
    pagination_class = LimitOffsetPagination
    permission_classes = (PromisPermission,)

    def get_queryset(self):

        queryset = models.Session.objects.all()
        polygon = self.request.query_params.get('polygon', None)
        user = self.request.user
        if not helpers.UserExists(user):
            return models.Session.objects.none()

        if helpers.UserGroupsNo(user) <= 0:
            now = datetime.datetime.now()
            half_year_ago = now - datetime.timedelta(183)
            ago = datetime.date(1900, 1, 1)
            queryset = models.Session.objects.filter(time_end__range = (ago, half_year_ago))
        else:
            queryset = models.Session.objects.all()

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
    permission_classes = (PromisPermission,)

class MeasurementsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Measurement.objects.all()
    serializer_class = serializer.MeasurementsSerializer
    permission_classes = (PromisPermission,)
    filter_class = MeasurementsFilter
    filter_backends = (DjangoFilterBackend,)

       

'''
#TODO: This is used only for debugging, and should be removed
#======== Added to view db contents. Remove it: ======

class DocumentsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Document.objects.all()
    serializer_class = serializer.DocumentsSerializer

class FunctionsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Function.objects.all()
    serializer_class = serializer.FunctionsSerializer

class ParameterssView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Parameter.objects.all()
    serializer_class = serializer.ParametersSerializer

#=====================================================
'''

class QuicklookView(RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = models.Document.objects.all()
    permission_classes = (PromisPermission,)
    serializer_class = serializer.QuickLookSerializer

class DownloadView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Measurement.objects.all()
    permission_classes = (PromisPermission,)
    serializer_class = serializer.DownloadViewSerializer

class DownloadData(viewsets.ReadOnlyModelViewSet):
    queryset = models.Document.objects.all()
    permission_classes = (PromisPermission,)
    serializer_class = serializer.DocumentsSerializer

class UserViewSet(viewsets.GenericViewSet, CreateModelMixin, UpdateModelMixin, RetrieveModelMixin):
    queryset = get_user_model().objects
    serializer_class = serializer.UserSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            self.permission_classes = (AllowAny,)
        else:
            self.permission_classes = (IsAuthenticated,)

        return super().get_permissions()

    def get_queryset(self):
        if self.request.user is not None:
            return get_user_model().objects.filter(username = self.request.user)
        else:
            get_user_model().objects.none()
