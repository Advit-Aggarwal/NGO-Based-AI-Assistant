from django.contrib import admin
from django.urls import path, include
from ngomanage.views import index_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ngomanage.urls')),
    path('', index_view, name='index'),
]
