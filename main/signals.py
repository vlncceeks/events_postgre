from django.db.models.signals import post_migrate
from django.contrib.auth.models import User
from django.dispatch import receiver

@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    superuser = 'ADMIN'
    if not User.objects.filter(username=superuser).exists():
        User.objects.create_superuser(superuser, 'admin@example.com', 'adminpassword')
        print("Суперпользователь создан автоматически")