from django.urls import path
from . import views

urlpatterns = [
    path('search', views.search_package, name='search'),
    path('validate', views.validate_requirements, name='validate'),
]