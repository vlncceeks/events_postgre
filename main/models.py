from django.db import models
from django.contrib.auth.models import User  # Модель пользователя для регистрации
from django.db.models.signals import post_save
from django.dispatch import receiver

class Event(models.Model):
    title = models.CharField('Название', max_length=250)
    author = models.CharField('Автор', max_length=250, blank=True, null=True)
    description = models.TextField('Описание', blank=True, null=True)
    materials = models.TextField('Материалы', blank=True, null=True)
    photo = models.ImageField(upload_to='images/', blank=True, null=True)

    def __str__(self):
        return self.title


class Session(models.Model):
    date_time = models.DateTimeField('Дата и время', unique=True)
    total_seats = models.PositiveIntegerField('Всего мест', default=0)

    def __str__(self):
        return self.date_time.strftime('%Y-%m-%d %H:%M')


class EventSession(models.Model):
    event = models.ForeignKey(Event, related_name="sessions", on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="sessions", verbose_name="Сессия", null=True, blank=True)
    available_seats = models.PositiveIntegerField('Свободные места', default=0)

    class Meta:
        unique_together = ('event', 'session')

    def __str__(self):
        return f"{self.event.title} — {self.session.date_time}"


class EventParticipant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    session = models.ForeignKey(EventSession, on_delete=models.CASCADE, verbose_name="Сеанс мероприятия")
    number_of_people = models.PositiveIntegerField("Количество человек", default=1)
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата регистрации")

    def save(self, *args, **kwargs):
        # Проверяем, достаточно ли свободных мест
        if self.number_of_people > self.session.available_seats:
            raise ValueError("Недостаточно свободных мест для записи!")

        # Уменьшаем количество доступных мест
        self.session.available_seats -= self.number_of_people
        self.session.save()

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Возвращаем места при удалении записи
        self.session.available_seats += self.number_of_people
        self.session.save()

        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} зарегистрирован на {self.session} ({self.number_of_people} чел.)"


# Сигналы
@receiver(post_save, sender=Session)
def assign_sessions_to_events(sender, instance, created, **kwargs):
    if created:
        # Привязываем новую сессию ко всем существующим событиям
        events = Event.objects.all()
        for event in events:
            EventSession.objects.create(
                event=event,
                session=instance,
                available_seats=instance.total_seats
            )


@receiver(post_save, sender=Event)
def assign_events_to_sessions(sender, instance, created, **kwargs):
    if created:
        # Привязываем новое событие ко всем существующим сессиям
        sessions = Session.objects.all()
        for session in sessions:
            EventSession.objects.create(
                event=instance,
                session=session,
                available_seats=session.total_seats
            )
