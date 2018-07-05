from django.urls import path
from . import views

urlpatterns = [
    path('upload', views.upload, name='upload'),
    path('build', views.build, name='build'),
    path('config', views.config, name='config'),
    path('up', views.up, name='up'),
    # path('scale') # scala i servizi a NUM
    path('stop', views.stop, name='stop'),
    path('logs', views.logs, name='logs'),
    path('status', views.status, name='status'),
]
