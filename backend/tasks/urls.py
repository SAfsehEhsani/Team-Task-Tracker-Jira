from django.urls import path
from tasks.views import (
    TeamTasksView,
    TaskDetailView,
    TaskCommentView
)

urlpatterns = [
    path('teams/<str:team_id>/tasks/', TeamTasksView.as_view(), name='team_tasks'),
    path('tasks/<str:task_id>/', TaskDetailView.as_view(), name='task_detail'),
    path('tasks/<str:task_id>/comments/', TaskCommentView.as_view(), name='task_comment'),
]
