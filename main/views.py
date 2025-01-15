from django.shortcuts import render

from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import EventSession, EventParticipant
import json


from django.contrib.auth.decorators import login_required
from .models import EventParticipant, Event
from .models import Session  
from .serializers import SessionSerializer  


from rest_framework.generics import ListAPIView
from .models import Event
from .serializers import EventSerializer
from rest_framework import filters

from rest_framework import serializers
from .models import Event, EventSession

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Event
from rest_framework.generics import RetrieveAPIView

import logging
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import EventSessionSerializer
import logging



class EventListView(ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']  # Поле, по которому будет происходить поиск


from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def index(request):
    return render(request, "main/index.html")

from django.middleware.csrf import get_token

def some_view(request):
    csrf_token = get_token(request)
    print("CSRF Token:", csrf_token)


# @login_required
# def register_for_event(request, event_id):
#     event = Events.objects.get(id=event_id)

#     # Проверяем, доступно ли место
#     if event.total_seats > 0:
#         # Проверяем, не записан ли пользователь уже на это мероприятие
#         if EventParticipant.objects.filter(user=request.user, event=event).exists():
#             return JsonResponse({"error": "Вы уже записаны на это мероприятие"}, status=400)

#         # Записываем пользователя
#         EventParticipant.objects.create(user=request.user, event=event)

#         # Уменьшаем количество доступных мест в базе данных
#         event.available_seats -= 1
#         event.save()

#         # Возвращаем обновленные данные о количестве мест
#         return JsonResponse({
#             "message": "Вы успешно записаны на мероприятие!",
#             "available_seats": event.available_seats
#         })

#     else:
#         return JsonResponse({"error": "Нет доступных мест"}, status=400)
# main/serializers.py


class EventSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSession
        fields = ['id', 'date_time', 'available_seats']

class EventSerializer(serializers.ModelSerializer):
    sessions = EventSessionSerializer(many=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'photo', 'materials', 'author', 'sessions']
# main/views.py


class EventListAPIView(APIView):
    def get(self, request):
        search_query = request.GET.get("search", "")
        events = Event.objects.filter(title__icontains=search_query)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
# main/views.py

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
def register_event(request, session_id):
    if request.method == 'POST':
        data = request.data
        
        # Проверка: пользователь авторизован
        if not request.user.is_authenticated:
            return Response({"error": "Пользователь не зарегистрирован. Войдите в систему, чтобы забронировать место."}, status=401)

        try:
            number_of_people = int(data.get('number_of_people', 0))
            if number_of_people <= 0:
                raise ValueError
        except ValueError:
            return Response({"error": "Неверное количество мест. Укажите корректное значение."}, status=400)

        # Получаем EventSession
        session = get_object_or_404(EventSession, id=session_id)

        # Проверка: забронировано ли уже пользователем это мероприятие
        if EventParticipant.objects.filter(user=request.user, session=session).exists():
            return Response({"error": "Вы уже зарегистрированы на это мероприятие."}, status=409)

        # Проверяем доступность мест
        if session.available_seats < number_of_people:
            return Response({"error": "Места заняты. Недостаточно свободных мест для бронирования."}, status=410)

        # Обновляем количество доступных мест
        session.available_seats -= number_of_people
        session.save()

        # Создаем запись о бронировании
        EventParticipant.objects.create(
            user=request.user,
            session=session,
            number_of_people=number_of_people
        )

        return Response({"success": True, "message": "Успешно забронировано!"}, status=200)

   

class EventDetailAPIView(RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class SessionListAPIView(ListAPIView):
    """
    API для получения списка всех сессий.
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer  # Используйте SessionSerializer здесь
    filter_backends = [DjangoFilterBackend]

    filterset_fields = ['date_time']  # Фильтрация по дате
