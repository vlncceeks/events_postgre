from django.urls import path
from . import views

from users_registration.views import login, register

app_name = 'users'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('', views.index),  # URL для главной страницы (после регистрации)
    path('login/', login, name='login')
    
    # path('login/', include(login.urls))
    #------------------------------
    # path('register/', views.login_view)
    #----------------------------
]