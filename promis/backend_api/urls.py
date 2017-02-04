from django.conf.urls import url, include
from backend_api import views
from rest_framework.routers import DefaultRouter
from django.conf.urls.static import static
from rest_framework_nested import routers

router = DefaultRouter()

router.register(r'Session', views.SessionsViewSet)
router.register(r'Translations', views.TranslationsViewSet)
router.register(r'Project', views.SpaceProjectsViewSet)
router.register(r'Device', views.DevicesViewSet)
router.register(r'Functions', views.FunctionsViewSet)
router.register(r'Channels', views.ChannelsViewSet)
router.register(r'Units', views.UnitsViewSet)
router.register(r'Values', views.ValuesViewSet)
router.register(r'Parameters', views.ParametersViewSet)
router.register(r'Documents', views.DocumentsViewSet)
router.register(r'Measurements', views.MeasurementsViewSet) 

urlpatterns = [
    url(r'^', include(router.urls)), ]
