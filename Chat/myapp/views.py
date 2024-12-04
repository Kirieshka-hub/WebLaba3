from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .forms import ProfileForm
from django.http import JsonResponse
from .models import Chat 
from .models import  ActiveChat
from django.db.models import Q
import json

def home_view(request):
    return render(request, 'home.html')

def profile_view(request, username=None):
    if username:
        # Получаем профиль пользователя по имени пользователя
        user = get_object_or_404(User, username=username)
        profile = user.profile  # Получаем профиль этого пользователя
    else:
        # Если имя пользователя не указано, получаем профиль текущего пользователя
        try:
            profile = request.user.profile
        except AttributeError:
            return redirect('account_login')  # Если у текущего пользователя нет профиля, перенаправляем на страницу входа

    return render(request, 'users/profile.html', {'profile': profile})

@login_required
def profile_edit_view(request):
    profile = request.user.profile  # Получаем профиль пользователя
    form = ProfileForm(instance=profile)
    onboarding = False

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')

    # Проверяем состояние onboarding
    if not profile.displayname or not profile.avatar or not profile.info:
        onboarding = True

    return render(request, 'users/edit_profile.html', {
        'form': form,
        'onboarding': onboarding,
        'profile': profile   
    })

@login_required
def profile_settings_view(request):
    return render(request, 'users/profile_settings.html')


@login_required
def update_email(request):
    if request.method == 'POST':
        request.user.email = request.POST.get('email')
        request.user.save()
        return redirect('profile-settings')  

@login_required
def delete_account(request):
    if request.method == 'POST':
        request.user.delete()
        return redirect('home')  # замените на имя вашего URL для домашней страницы

# def messanger_view(request):
#     return render(request, 'chat.html', {'users': []})


@login_required
def search_users_view(request):
    query = request.GET.get('query', '').strip()
    users = []
    if query and query.startswith('@'):
        query = query[1:]  # Убираем '@' из запроса
        users = User.objects.filter(username__icontains=query)[:10]

    if len(users) == 1:
        # Если пользователь найден, переходим к чату
        return redirect('load_chat', username=users[0].username)

    return render(request, 'chat/search_results.html', {'users': users})


@login_required
def load_chat_view(request, username):
    """
    Загружает чат с указанным пользователем.
    """
    recipient = get_object_or_404(User, username=username)
    messages = Message.objects.filter(
        Q(sender=request.user, recipient=recipient) |
        Q(sender=recipient, recipient=request.user)
    ).order_by('timestamp')

    # Сохраняем чат в навбар
    chat, created = Chat.objects.get_or_create(user=request.user, contact=recipient)

    context = {
        'recipient': recipient,
        'messages': messages,
    }
    return render(request, 'chat/chat_window.html', context)



@login_required
def send_message_view(request, username):
    if request.method == 'POST':
        recipient = get_object_or_404(User, username=username)
        text = request.POST.get('message')

        if text:
            # Создаём сообщение
            message = Message.objects.create(sender=request.user, recipient=recipient, text=text)

            # Обновляем или создаём чат
            Chat.objects.update_or_create(
                user=request.user,
                contact=recipient,
                defaults={'last_message': text, 'updated_at': message.timestamp}
            )
            Chat.objects.update_or_create(
                user=recipient,
                contact=request.user,
                defaults={'last_message': text, 'updated_at': message.timestamp}
            )

    # Перенаправляем обратно на страницу чата
    return redirect('load_chat', username=username)

@login_required
def messanger_view(request):
    chats = Chat.objects.filter(user=request.user).order_by('-updated_at')
    return render(request, 'chat.html', {'chats': chats})


# 
@login_required
def chat_history_view(request, username):
    receiver = get_object_or_404(User, username=username)
    messages = Chat.objects.filter(
        (Q(sender=request.user) & Q(receiver=receiver)) |
        (Q(sender=receiver) & Q(receiver=request.user))
    ).order_by('timestamp')

    message_list = [{'sender': msg.sender.username, 'message': msg.message} for msg in messages]
    
    return JsonResponse({
        'avatar': receiver.profile.avatar if receiver.profile.avatar else '/static/images/default_avatar.png',
        'displayname': receiver.profile.name or receiver.username,
        'messages': message_list,
        'current_user': request.user.username,  # Передаем текущего пользователя
    })


@login_required
def send_message(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        receiver_username = data['receiver']
        message_content = data['message']
        
        receiver = get_object_or_404(User, username=receiver_username)
        
        # Создаем сообщение
        Chat.objects.create(sender=request.user, receiver=receiver, message=message_content)
        
        # Сохраняем активный чат
        ActiveChat.objects.get_or_create(user=request.user, chat_user=receiver)
        ActiveChat.objects.get_or_create(user=receiver, chat_user=request.user)  # Для обоих пользователей
        
        return JsonResponse({'status': 'success'})
    
    return JsonResponse({'status': 'error', 'error': 'Invalid request'})

    
@login_required
def clear_chat(request, username):
    """
    Удаляет сообщения между текущим пользователем и выбранным пользователем,
    но оставляет активный чат для другого пользователя.
    """
    chat_user = get_object_or_404(User, username=username)

    # Удаляем только сообщения, где текущий пользователь отправитель или получатель
    Chat.objects.filter(
        (Q(sender=request.user) & Q(receiver=chat_user)) |
        (Q(sender=chat_user) & Q(receiver=request.user))
    ).delete()

    # Удаляем активный чат для текущего пользователя
    ActiveChat.objects.filter(user=request.user, chat_user=chat_user).delete()

    return JsonResponse({'status': 'success'})


@login_required
def get_active_chats(request):
    active_chats = ActiveChat.objects.filter(user=request.user).select_related('chat_user')
    results = [
        {
            'username': chat.chat_user.username,
            'displayname': chat.chat_user.profile.name,
            'avatar': chat.chat_user.profile.avatar if chat.chat_user.profile.avatar else '/static/images/default_avatar.png',
        }
        for chat in active_chats
    ]
    return JsonResponse({'results': results})


@login_required
def get_received_messages_users(request):
    """
    Возвращает список пользователей, которые отправили сообщения текущему пользователю,
    но которых еще нет в списке активных чатов.
    """
    received_users = User.objects.filter(
        chat_receiver__sender=request.user
    ).distinct().exclude(
        active_chats__chat_user=request.user
    )

    results = [
        {
            'username': user.username,
            'displayname': user.profile.name,
            'avatar': user.profile.avatar if user.profile.avatar else '/static/images/default_avatar.png',
        }
        for user in received_users
    ]
    return JsonResponse({'results': results})



