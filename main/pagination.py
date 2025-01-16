from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 3
    page_size_query_param = 'page_size'  # Пользователь может указать размер страницы
    max_page_size = 50  # Максимальный размер страницы
