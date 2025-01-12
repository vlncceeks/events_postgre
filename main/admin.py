from django.contrib import admin

from .models import Event

admin.site.register(Event)

from .models import EventParticipant

# class EventParticipantAdmin(admin.ModelAdmin):
#     list_display = ('user', 'event', 'registered_at')  # Список полей, которые будут отображаться в админке
#     search_fields = ('user__username', 'event__title')  # Поиск по пользователю и мероприятию




from .models import EventSession


class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'author')
    search_fields = ('title', 'author')

@admin.register(EventSession)
class EventSessionAdmin(admin.ModelAdmin):
    list_display = ('event', 'date_time', 'total_seats', 'available_seats')
    list_filter = ('event', 'date_time')
    search_fields = ('event__title',)

@admin.register(EventParticipant)
class EventParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'number_of_people', 'registered_at')
    list_filter = ('session__event', 'registered_at')
    search_fields = ('user__username', 'session__event__title')


# admin.site.register(EventParticipant, EventParticipantAdmin)