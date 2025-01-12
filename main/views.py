from django.shortcuts import render

from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import EventSession, EventParticipant
import json


from django.contrib.auth.decorators import login_required
from .models import EventParticipant, Event


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

class EventListView(ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']  # Поле, по которому будет происходить поиск



def index(request):
    return render(request, "main/index.html")



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
        try:
            number_of_people = int(data['number_of_people'])
        except ValueError:
            return Response({"error": "'number_of_people' должно быть числом."}, status=400)

        # Получаем сессию
        session = get_object_or_404(EventSession, id=session_id)

        # Проверка, забронировано ли уже пользователем это мероприятие
        if EventParticipant.objects.filter(user=request.user, session=session).exists():
            return Response({"error": "Вы уже зарегистрированы на это мероприятие."}, status=400)

        if session.available_seats < number_of_people:
            return Response({"error": "Недостаточно мест."}, status=400)

        # Обновляем количество мест
        session.available_seats -= number_of_people
        session.save()

        # Бронирование
        EventParticipant.objects.create(
            user=request.user,
            session=session,
            number_of_people=number_of_people
        )

        return Response({"success": True, "message": "Успешно забронировано!"}, status=200)







class EventDetailAPIView(RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
