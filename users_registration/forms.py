from django import forms
# from .models import Users

from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

from django.contrib.auth.models import User


class UserLoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'input__login', 'placeholder':'Логин'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'input__password', 'placeholder':'Пароль'}))
    class Meta:
        model = User
        fields = ('username', 'password')


class UserRegistrationForm(UserCreationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'input__login', 'placeholder':'Логин'}))
    email = forms.CharField(widget=forms.EmailInput(attrs={'class': 'input__email', 'placeholder':'email'}))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'input__password', 'placeholder':'Пароль'}))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'input__password', 'placeholder':'Повторите пароль'}))
    
    class Meta:
        model = User
        fields =('username', 'email', 'password1', 'password2')



# class UserForm(forms.ModelForm):
#     password2 = forms.CharField(widget=forms.PasswordInput, label='Повторите пароль')

#     class Meta:
#         model = Users
#         fields = ['login', 'email', 'password']

#     def clean(self):
#         cleaned_data = super().clean()
#         password = cleaned_data.get('password')
#         password2 = cleaned_data.get('password2')

#         # Проверка на совпадение паролей
#         if password and password2 and password != password2:
#             raise forms.ValidationError("Пароли не совпадают")

#         return cleaned_data

