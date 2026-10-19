from django.urls import path
from authentication.views import (
    RegisterView,
    LoginView,
    RefreshTokenView,
    CurrentUserView,
    UsersListCreateView,
    UserDetailAdminView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('refresh/', RefreshTokenView.as_view(), name='auth_refresh'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
    path('users/', UsersListCreateView.as_view(), name='auth_users_list_create'),
    path('users/<str:user_id>/', UserDetailAdminView.as_view(), name='auth_user_detail_admin'),
]
