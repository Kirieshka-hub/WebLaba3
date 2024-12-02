from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .forms import ProfileForm
from django.http import JsonResponse
from .models import Chat, Message  # Добавьте Chat в список импортов
from django.db.models import Q


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

