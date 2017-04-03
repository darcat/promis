from django.conf.urls import url, include
from backend_api import views
from djsw_wrapper.router import SwaggerRouter
from django.conf.urls.static import static
from rest_framework_nested import routers
from rest_framework.routers import SimpleRouter, DefaultRouter

router = SwaggerRouter()

userreg = SimpleRouter()
userreg.register(r'user', views.UserViewSet)

#== db view ==

dbview = SimpleRouter()
dbview.register(r'functions', views.FunctionsView)
dbview.register(r'documents', views.DocumentsView)

#=============

urlpatterns =  router.urls + userreg.urls + [
    url('^api-auth/', include('rest_framework.urls', namespace = 'rest_framework'))
    ] + dbview.urls

 

