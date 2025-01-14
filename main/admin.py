from django.contrib import admin

from .models import Event, EventSession, Session, EventParticipant

# admin.site.register(Event)


# class EventParticipantAdmin(admin.ModelAdmin):
#     list_display = ('user', 'event', 'registered_at')  # Список полей, которые будут отображаться в админке
#     search_fields = ('user__username', 'event__title')  # Поиск по пользователю и мероприятию
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'description')

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('date_time', 'total_seats')

@admin.register(EventSession)
class EventSessionAdmin(admin.ModelAdmin):
    list_display = ('event', 'session', 'available_seats')
    list_filter = ('event', 'session')

@admin.register(EventParticipant)
class EventParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'number_of_people', 'registered_at')
    list_filter = ('session', 'user')



# admin.site.register(EventParticipant, EventParticipantAdmin)