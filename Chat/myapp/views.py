from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .forms import ProfileForm
from django.http import JsonResponse

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

def messanger_view(request):
    return render(request, 'Chat.html')


@login_required
def search_users(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest' and 'query' in request.GET:
        query = request.GET.get('query').strip()
        if query.startswith('@'):
            query = query[1:]  # Убираем '@' из запроса

        users = User.objects.filter(username__icontains=query)[:10]  # Ограничиваем количество результатов
        results = [
            {
                'username': user.username,
                'displayname': user.profile.name,
                'avatar': user.profile.avatar,
            }
            for user in users
        ]
        return JsonResponse({'results': results})
    return JsonResponse({'results': []})

