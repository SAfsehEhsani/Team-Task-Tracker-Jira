from django.urls import path
from activity.views import TeamTimelineView

urlpatterns = [
    path('teams/<str:team_id>/timeline/', TeamTimelineView.as_view(), name='team_timeline'),
]
