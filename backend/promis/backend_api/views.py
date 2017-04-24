# -*- coding: utf-8 -*-

from rest_framework.views import APIView
from rest_framework.generics import  GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
from rest_framework import filters
from rest_framework.mixins import RetrieveModelMixin, ListModelMixin
from rest_framework.mixins import CreateModelMixin, UpdateModelMixin
from rest_framework.decorators import detail_route, api_view

from backend_api import models
from backend_api import serializer, helpers
from backend_api.permission import PromisPermission, SelfProfilePermission

import django_filters

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.pagination import LimitOffsetPagination
from django.contrib.gis.geos import GEOSGeometry, GEOSException

from django.contrib.auth import get_user_model

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotAuthenticated, NotFound, MethodNotAllowed


import datetime
from rest_framework.decorators import permission_classes

class SessionFilter(django_filters.rest_framework.FilterSet):
    time_begin = django_filters.IsoDateTimeFilter(lookup_expr='gte')
    time_end = django_filters.IsoDateTimeFilter(lookup_expr='lte')
    project = django_filters.ModelChoiceFilter(name='space_project',
                                               queryset = models.Space_project.objects.all())
    satellite = django_filters.ModelChoiceFilter(name='space_project',
                                                 queryset = models.Space_project.objects.all())

    class Meta:
        model = models.Session
        fields = ['space_project', 'time_begin', 'time_end', 'project', 'satellite']

class MeasurementsFilter(django_filters.rest_framework.FilterSet):

    class Meta:
        model = models.Measurement
        fields = ['session', 'parameter']

class ProjectsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Space_project.objects.all()
    serializer_class = serializer.SpaceProjectsSerializer
    permission_classes = (AllowAny,)

class DevicesView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Device.objects.all()
    serializer_class = serializer.DevicesSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('satellite',)
    permission_classes = (AllowAny,)

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
    permission_classes = (AllowAny,)

    def get_queryset(self):

        queryset = models.Session.objects.all()
        polygon = self.request.query_params.get('polygon', None)

#commented to allow Anonymous access
        '''
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
        '''

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
    permission_classes = (AllowAny,)

class MeasurementsView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Measurement.objects.all()
    serializer_class = serializer.MeasurementsSerializer
    permission_classes = (AllowAny,)
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
    def _quicklook(self, obj, src_name, src_serializer):
        '''Generalized quicklook function'''
        # TODO: JSON/HTML-ify the responses here?
        # TODO: 422 instead of 404 for incorrect params?
        # TODO: most of the raises here are redundant and should be done
        # in validators.

        # Determining the quicklook function
        quicklook_fun = getattr(obj, src_name).quicklook

        if not quicklook_fun:
            raise MethodNotAllowed('< no quicklook defined >')

        # TODO: many stubs here depend on the knowledge of the JSON structure
        # which varies type to type. Making 100500 functions is unfeasible, so
        # we might want to wrap this into classes with known interface and
        # use JSON as pickle/unpickle medium or something. Postponed to post-alpha
        # see and use #63 for more details.

        # Determining the quality of a quicklook
        try:
            npoints = int(self.request.query_params['points'])
        except KeyError:
            # TODO: configurable default or per-type setting here
            npoints = 200
        except ValueError:
            raise NotFound("Amount of points is not a number")

        # Various checks on the number received
        if npoints <= 0:
            raise NotFound("Non-positive amount of points requested")

        # TODO: STUB: determine upper cap, that depends on the type in question
        # if npoints > max_points_for_this_json:
        #   raise NotFound("Too much points requested")

        # TODO: STUB: determine if user is not authenticated, lower the cap for them
        # if user_not_authenticated and npoints > max_points_for_this_json * some_coeff:
        #   raise NotAuthenticated

        ser = serializer.QuickLookSerializer(obj, context = { 'func': quicklook_fun,
                                                              'kwargs': { 'npoints': npoints },
                                                              'serializer': src_serializer,
                                                              'source': src_name,
                                                              'need_geo_line': False } )
        return Response(ser.data)

    @detail_route(permission_classes = [AllowAny,])
    def channel(self, request, id):
        obj = self.queryset.get(pk = id)
        return self._quicklook(obj, "channel", serializer.ChannelsSerializer)

    @detail_route(permission_classes = [AllowAny,])
    def parameter(self, request, id):
        obj = self.queryset.get(pk = id)
        return self._quicklook(obj, "parameter", serializer.ParametersSerializer)

    queryset = models.Measurement.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = serializer.MeasurementsSerializer

class DownloadView(viewsets.ReadOnlyModelViewSet):
    queryset = models.Measurement.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = serializer.DownloadViewSerializer

# TODO: make a common base class for this and QuicklookView
class DownloadData(RetrieveModelMixin, viewsets.GenericViewSet):
    def _export(self, obj, src_name, src_serializer):
        # TODO: comment this code, merge it with quicklook
        try:
            fmt = self.request.query_params['fmt']
        except KeyError:
            fmt = 'json'

        # if fmt == 'json':
        ser = serializer.JSONDataSerializer(obj, context = { 'serializer': src_serializer, 'source': src_name } )
        # else:
        #     quicklook_fun = getattr(obj, src_name).quicklook
        #
        #     if not quicklook_fun:
        #         raise MethodNotAllowed('< no quicklook defined >')
        #
        #     ser = serializer.QuickLookSerializer(obj, context = { 'func': quicklook_fun,
        #                                                           'kwargs': { 'npoints': npoints },
        #                                                           'serializer': src_serializer,
        #                                                           'source': src_name,
        #                                                           'need_geo_line': False } )

        return Response(ser.data)

# TODO: why is it pk here and id above???
    @detail_route(permission_classes = [AllowAny,])
    def channel(self, request, pk):
        obj = self.queryset.get(pk = pk)
        return self._export(obj, "channel", serializer.ChannelsSerializer)

    @detail_route(permission_classes = [AllowAny,])
    def parameter(self, request, pk):
        obj = self.queryset.get(pk = pk)
        return self._export(obj, "parameter", serializer.ParametersSerializer)

    queryset = models.Measurement.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = serializer.MeasurementsSerializer

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
