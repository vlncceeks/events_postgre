# from django.shortcuts import render
# from django.contrib.auth.decorators import login_required

# from django.contrib.auth import authenticate, login as user_login, logout as user_logout
# from django.http import HttpResponseRedirect


# @login_required
# def register(request):
#     return render(request, 'users_registration/registration.html')

#------------------------------
# def login_view(request):
#     if request.method == 'POST':
#         login = request.POST.get('login')
#         password = request.POST.get('password')
        
#         usr = authenticate(request, username=login, password=password)
#         if usr is not None:
#             user_login(request, usr)
#             return HttpResponseRedirect('/')
#         else:
#             return render(request, template_name='register/registration.html')

#     return render(request, template_name='register/registration.html')

#--------------------

from django.shortcuts import render, HttpResponsePermanentRedirect
from users_registration.forms import UserLoginForm, UserRegistrationForm
from django.contrib import auth  
from django.urls import reverse
# , redirect
# from django.contrib import messages
# from .forms import UserForm  # Импортируем форму регистрации
# from .models import Users  # Импортируем модель пользователей

# def register(request):
#     if request.method == 'POST':
#         form = UserForm(request.POST)
        
#         # Если форма валидна, сохраняем данные
#         if form.is_valid():
#             # Сохраняем данные в базе данных
#             user = form.save(commit=False)
#             # Дополнительно можно обработать данные перед сохранением, например:
#             # user.password = hash_password(user.password)  # Если нужно, например, хэшировать пароль
#             user.save()
#             messages.success(request, "Вы успешно зарегистрированы!")
#             return redirect('/')  # Перенаправляем на главную страницу после успешной регистрации
#         else:
#             messages.error(request, "Ошибка в форме. Пожалуйста, исправьте её.")
#     else:
#         form = UserForm()

#     return render(request, 'users_registration/registration.html', {'form': form})

def index(request):
    return render(request, "main/index.html")
    
def login(request):
    if request.method == 'POST':
        form = UserLoginForm(data=request.POST)
        if form.is_valid():
            username = request.POST['username']
            password = request.POST['password']
            user = auth.authenticate(username=username, password=password)
            if user:
                auth.login(request, user)
                return(HttpResponsePermanentRedirect("/"))
                
    else:
        form = UserLoginForm()
    
    context = {'form': form}
    return render(request, 'users_registration/login.html', context)

def register(request):
    if request.method =="POST":
        form = UserRegistrationForm(data=request.POST)
        if form.is_valid():
            form.save()
            return HttpResponsePermanentRedirect(reverse('users:login'))
    else:
        form = UserRegistrationForm()
            
    context = {'form': form}
    return render(request, 'users_registration/registration.html', context)