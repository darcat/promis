from django.conf.urls import url, include
from backend_api import views
from djsw_wrapper.router import SwaggerRouter
from django.conf.urls.static import static
from rest_framework_nested import routers
from rest_framework.routers import SimpleRouter, DefaultRouter

router = SwaggerRouter()

userreg = SimpleRouter()
userreg.register(r'user', views.UserViewSet)


docrout = SimpleRouter()
# TODO: maaaybe we go as far as /measurements/<id>/quicklook ?
docrout.register(r'api/download', views.DownloadView)
# TODO: playground code below, swaggerise & combine REFACTOR
docrout.register(r'api/data', views.DataView)

urlpatterns =  router.urls + userreg.urls + [
    url('^api-auth/', include('rest_framework.urls', namespace = 'rest_framework')),
    url(r'^user/update/$', views.UserUpdate),
    ] + docrout.urls

