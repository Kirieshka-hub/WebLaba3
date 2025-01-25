
from django.forms import ModelForm
from django import forms
from .models import Profile
from allauth.account.forms import SignupForm

class ProfileForm(ModelForm):
    class Meta:
        model = Profile
        exclude = ['user']
        widgets = {
            'image': forms.FileInput(),
            'displayname' : forms.TextInput(attrs={'placeholder': 'Add display name'}),
            'info' : forms.Textarea(attrs={'rows':3, 'placeholder': 'Add information'})
        }
        

class CustomSignupForm(SignupForm):
    username = forms.CharField(
        max_length=30,
        widget=forms.TextInput(attrs={
            'class': 'custom-input',  # Задаем ваш класс
        }),
        label='Username'  # Настраиваем текст лейбла, если требуется
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'custom-input',
        }),
        label='Email Address'
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'custom-input',
        }),
        label='Password'
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'custom-input',
        }),
        label='Confirm Password'
    )

    class Meta:
        model = forms.ModelForm
        fields = ['username', 'email', 'password1', 'password2']




