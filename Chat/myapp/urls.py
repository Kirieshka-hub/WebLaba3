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

    path('search_users/', views.search_users, name='search_users'),
    path('chat/<str:username>/', views.chat_history_view, name='chat_history'),
    path('send_message/', views.send_message, name='send_message'),
    path('clear_chat/<str:username>/', views.clear_chat, name='clear_chat'),
    path('active_chats/', views.get_active_chats, name='active_chats'), 
    path('received_messages_users/', views.get_received_messages_users, name='received_messages_users'),

]
