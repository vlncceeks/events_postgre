from rest_framework import serializers
from .models import Event, EventSession

class EventSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSession
        fields = ['id', 'date_time', 'available_seats']

class EventSerializer(serializers.ModelSerializer):
    sessions = EventSessionSerializer(many=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'photo', 'materials', 'author', 'sessions']
