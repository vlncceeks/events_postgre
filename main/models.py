from django.db import models
from django.contrib.auth.models import User  # Модель пользователя для регистрации

class Event(models.Model):
    title = models.CharField('Название', max_length=250)
    author = models.CharField('Автор', max_length=250, blank=True, null=True)
    description = models.TextField('Описание', blank=True, null=True)
    materials = models.TextField('Материалы', blank=True, null=True)
    photo = models.ImageField(upload_to='images/', blank=True, null=True)

    def __str__(self):
        return self.title

class EventSession(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="sessions", verbose_name="Мероприятие")
    date_time = models.DateTimeField(verbose_name="Дата и время сеанса")
    total_seats = models.PositiveIntegerField('Всего мест', default=0)
    available_seats = models.PositiveIntegerField('Свободные места', default=0)

    def save(self, *args, **kwargs):
        if self.available_seats > self.total_seats:
            raise ValueError("Свободных мест не может быть больше, чем всего мест!")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.event.title} - {self.date_time.strftime('%Y-%m-%d %H:%M')}"

class EventParticipant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")  # Кто зарегистрировался
    session = models.ForeignKey(EventSession, on_delete=models.CASCADE, verbose_name="Сеанс мероприятия", null=True, default="1")  # На какой сеанс
    number_of_people = models.PositiveIntegerField("Количество человек", default=1)  # Количество участников
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата регистрации")

    def save(self, *args, **kwargs):
        # Проверяем, достаточно ли свободных мест
        if self.number_of_people > self.session.available_seats:
            raise ValueError("Недостаточно свободных мест для записи!")
        
        # Уменьшаем количество доступных мест на сеансе
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
