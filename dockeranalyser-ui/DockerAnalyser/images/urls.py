from django.urls import path
from . import views

urlpatterns = [
    path('list', views.images_list, name='images_list'),
    path('search', views.images_search, name='images_search'),
    path('stats', views.images_stats, name='images_stats'),
    path('drop', views.images_drop, name='images_drop'),
    path('export', views.images_export, name='images_export'),
]