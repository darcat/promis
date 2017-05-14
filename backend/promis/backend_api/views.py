# -*- coding: utf-8 -*-

from rest_framework.views import APIView
from rest_framework.generics import  GenericAPIView, ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
from rest_framework import filters
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin
from rest_framework.decorators import detail_route, api_view

from backend_api import models
from backend_api import serializer, helpers, renderer
from backend_api.permission import PromisPermission, SelfProfilePermission, Level1Permission

import django_filters

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.pagination import LimitOffsetPagination
from django.contrib.gis.geos import GEOSGeometry, GEOSException

from django.contrib.auth import get_user_model

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotAuthenticated, NotFound, MethodNotAllowed
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer

import unix_time

import datetime
from rest_framework.decorators import permission_classes

class PromisViewSet(viewsets.ReadOnlyModelViewSet):
    '''Collects most commonly used View stuff'''
    lookup_field = 'id'
    permission_classes = (AllowAny,)
    # TODO: Is it okay to put it here even for classes that don't need it?
    filter_backends = (DjangoFilterBackend,)

class SessionFilter(django_filters.rest_framework.FilterSet):
    time_begin = django_filters.NumberFilter(method='unix_time_filter')
    time_end = django_filters.NumberFilter(method='unix_time_filter')
    project = django_filters.ModelChoiceFilter(name='space_project',
                                               queryset = models.Space_project.objects.all())
    satellite = django_filters.ModelChoiceFilter(name='space_project',
                                                 queryset = models.Space_project.objects.all())

    # TODO: make a separate class?
    def unix_time_filter(self, queryset, name, value):
        # Composition of the queryset.filter argument depending on which field was used
        filter_actions = { 'time_begin': 'time_begin__gte', 'time_end': 'time_end__lte' }
        return queryset.filter(**{ filter_actions[name]: unix_time.maketime(value) })


    class Meta:
        model = models.Session
        fields = ['space_project', 'time_begin', 'time_end', 'project', 'satellite']

class MeasurementsFilter(django_filters.rest_framework.FilterSet):

    class Meta:
        model = models.Measurement
        fields = ['session', 'parameter']

class ProjectsView(PromisViewSet):
    queryset = models.Space_project.objects.all()
    serializer_class = serializer.SpaceProjectsSerializer

class ChannelsView(PromisViewSet):
    queryset = models.Channel.objects.all()
    serializer_class = serializer.ChannelsSerializer

class ParametersView(PromisViewSet):
    queryset = models.Parameter.objects.all()
    serializer_class = serializer.ParametersSerializer
    filter_fields = ('channel',)

class DevicesView(PromisViewSet):
    queryset = models.Device.objects.all()
    serializer_class = serializer.DevicesSerializer
    filter_fields = ('space_project',)


class SessionsView(PromisViewSet):
    queryset = models.Session.objects.all()
    serializer_class = serializer.SessionsSerializer
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


class MeasurementsView(PromisViewSet):
    queryset = models.Measurement.objects.all()
    serializer_class = serializer.MeasurementsSerializer
    filter_class = MeasurementsFilter


class DownloadView(viewsets.GenericViewSet):
    '''
    Handles data downloads and quicklooks.

    Data source defined by source request parameter
    which can be either channel or parameter.

    Operation is defined by the last path element
    which can be either data or quicklook.

    Data method takes a fmt parameter (shared with Django)
    that determines the output format.

    Quicklook method takes a points parameter which
    determines the resolution of a quicklook.

    Both accept time_start and time_end parameters in
    UNIX seconds at UTC to specify data slicing.

    Ideally we could support slicing by a polygon, but not now
    '''
    # TODO: seriously? Django displays a docstring?

    # Basically what RetrieveModelMixin does, but without
    # creating a separate "-detail" view
    # TODO: when we fix swagger route generation this may be
    # turned redundant by just inheriting the mixin
    def create_data(self):
        try:
            self.time_filter = [ self.request.query_params.get(key, None) for key in [ 'time_start', 'time_end' ] ]
            self.time_filter = [ int(x) if x is not None else None for x in self.time_filter ]
        except ValueError:
            raise NotFound("Time filter is not a number")

        # TODO: check that time_filter lies within the session's bounds

        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Inject additional headers if necessary
        res = Response(data)

        # If the format is not JSON/API, instruct the browser to download the file
        fmt = self.request.query_params.get('format')
        if fmt not in ('api', 'json', None):
            res['Content-Disposition'] = "attachment; filename={}_{}_{}.{}".format(data['timelapse']['start'],
                                                                                   data['timelapse']['end'],
                                                                                   data['value']['short_name'],
                                                                                   fmt)
        return res

    @detail_route(permission_classes = (AllowAny,))
    def quicklook(self, request, id):
        # TODO: JSON/HTML-ify the responses here?
        # TODO: 422 instead of 404 for incorrect params?
        # TODO: most of the raises here are redundant and should be done
        # in validators.
        # TODO: determine where exactly should the validation happen

        # Determining the quality of a quicklook
        try:
            # TODO: configurable default or per-type setting here
            self.points = int(request.query_params.get('points', 100))
        except ValueError:
            raise NotFound("Amount of points is not a number")

        # Various checks on the number received
        if self.points <= 0:
            raise NotFound("Non-positive amount of points requested")

        self.serializer_class = serializer.QuicklookSerializer
        return self.create_data()

    @detail_route(permission_classes = (AllowAny,), # TODO: other permission class
                  renderer_classes = (BrowsableAPIRenderer,
                                      JSONRenderer,
                                      renderer.AsciiRenderer,
                                      renderer.CSVRenderer))
    def data(self, request, id):
        self.serializer_class = serializer.JSONDataSerializer

        return self.create_data()

    lookup_field = 'id'
    queryset = models.Measurement.objects.all()


class UserPagination(LimitOffsetPagination):
    def get_paginated_response(self, data):
        return Response({
            'logged' : True,
            'userdata' : data
        })

class UserViewSet(viewsets.GenericViewSet, CreateModelMixin, ListModelMixin):
    queryset = get_user_model().objects
    serializer_class = serializer.UserSerializer
    pagination_classes = UserPagination

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

    def paginate_queryset(self, queryset, view=None):
    # couldn't find a better solution
        return None


@api_view(['POST', 'PUT'])
@permission_classes((SelfProfilePermission, IsAuthenticated))
def UserUpdate(request):
    try:
        user = get_user_model().objects.get(username = request.user)
    except get_user_model().DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST' or request.method == 'PUT':

            ser = serializer.UserSerializer(user, data=request.data, partial=True)
            if ser.is_valid():
                ser.save()
                return Response(ser.data, status=status.HTTP_202_ACCEPTED)
            else:
                return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
