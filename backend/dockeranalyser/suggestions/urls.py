from django.urls import path
from . import views

urlpatterns = [
    path('images_service', views.inspect_images_service, name='inspect_images_service'),
    path('validate', views.validate_code, name='validate_code'),
]