from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from myapp.views import profile_view

# Импортируйте ваше представление для обработки 404
from myapp.views import custom_404_view

handler404 = custom_404_view  # Указываем обработчик 404


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
    path("accounts/",include("allauth.urls")),
    path("",include('myapp.urls')),
    path("messanger/@<username>/", profile_view, name="profile"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
