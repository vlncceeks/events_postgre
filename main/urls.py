from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import EventListAPIView
from .views import register_event
from .views import EventDetailAPIView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', views.index),
    # path('api/events/', views.events_list, name='events_list'),
]

from .views import EventListView

urlpatterns += [
    path('api/events/', EventListView.as_view(), name='event-list'),
    # path('api/register_event/<int:event_id>/', views.register_for_event, name='register_for_event'),
    path('users/register', auth_views.LoginView.as_view(), name='register'),  # Добавьте эту строку
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),  # Здесь "/" это путь к главной странице
    path('api/register_event/<int:session_id>/', views.register_event, name='register-event'),
    path('api/events/<int:pk>/', EventDetailAPIView.as_view(), name='event-detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

