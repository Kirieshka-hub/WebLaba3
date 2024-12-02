from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from . import views 

urlpatterns = [
    path("", views.home_view, name="home"),

    path("profile/", views.profile_view, name="profile"),
    path("profile/edit/", views.profile_edit_view, name="edit-profile"),
    path("profile/settings/", views.profile_settings_view, name="profile-settings"),

    path('update_email/', views.update_email, name='update_email'),
    path('delete_account/', views.delete_account, name='delete_account'),

    path('messanger/', views.messanger_view, name="messanger"),
    
    path('search-users/', views.search_users_view, name='search_users'),
    path('chat/<str:username>/', views.load_chat_view, name='load_chat'),
    path('chat/<str:username>/send/', views.send_message_view, name='send_message'),
    

]
