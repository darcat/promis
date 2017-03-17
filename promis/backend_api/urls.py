from django.conf.urls import url, include
from backend_api import views
from djsw_wrapper.router import SwaggerRouter
from django.conf.urls.static import static
from rest_framework_nested import routers
from rest_framework.routers import SimpleRouter 

router = SwaggerRouter()

sr = SimpleRouter()
sr.register(r'SpaceProject', views.ProjectsView)

print ('Simple Routers: ') 
print (sr.urls)

print ('Swagger Routers: ') 
print (router.get_urls())
urlpatterns = router.get_urls() + sr.urls
