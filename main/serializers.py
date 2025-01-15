from rest_framework import serializers
from .models import Event, EventSession, Session

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'date_time', 'total_seats']


class EventSessionSerializer(serializers.ModelSerializer):
    date_time = serializers.SerializerMethodField()
    total_seats = serializers.SerializerMethodField()

    class Meta:
        model = EventSession
        fields = ['id', 'available_seats', 'date_time', 'total_seats']

    def get_date_time(self, obj):
        # Убедитесь, что у объекта есть связанная сессия
        if obj.session:
            return obj.session.date_time
        return None

    def get_total_seats(self, obj):
        if obj.session:
            return obj.session.total_seats
        return None




class EventSerializer(serializers.ModelSerializer):
    event_sessions = EventSessionSerializer(many=True, read_only=True, source='sessions')

    class Meta:
        model = Event

        fields = ['id', 'title', 'description', 'photo', 'materials', 'author', 'event_sessions']
