from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from myapp.views import profile_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path("accounts/",include("allauth.urls")),
    path("",include('myapp.urls')),
    path("messanger/@<username>/", profile_view, name="profile"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
