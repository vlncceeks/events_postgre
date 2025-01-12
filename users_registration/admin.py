from django.contrib import admin


from .models import Users

class UsersAdmin(admin.ModelAdmin):
    list_display = ['login', 'email']  # Перечислите, какие поля вы хотите показывать в списке пользователей

admin.site.register(Users, UsersAdmin)

