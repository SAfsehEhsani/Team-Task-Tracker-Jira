from django.urls import path
from teams.views import (
    TeamListCreateView,
    TeamDetailView,
    TeamInviteView,
    TeamRemoveMemberView,
    InvitationDetailView,
    AcceptInvitationView,
)

urlpatterns = [
    path('', TeamListCreateView.as_view(), name='teams_list_create'),
    path('invitations/<str:token>/', InvitationDetailView.as_view(), name='invitation_detail_teams'),
    path('invitations/<str:token>/accept/', AcceptInvitationView.as_view(), name='invitation_accept_teams'),
    path('<str:team_id>/', TeamDetailView.as_view(), name='team_detail'),
    path('<str:team_id>/invite/', TeamInviteView.as_view(), name='team_invite'),
    path('<str:team_id>/members/<str:user_id>/', TeamRemoveMemberView.as_view(), name='team_remove_member'),
]
