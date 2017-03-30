from django.conf.urls import url, include
from backend_api import views
from djsw_wrapper.router import SwaggerRouter
from django.conf.urls.static import static
from rest_framework_nested import routers
from rest_framework.routers import SimpleRouter, DefaultRouter

router = SwaggerRouter()

urlpatterns =  router.urls

