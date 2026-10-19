from django.urls import path, include
from rest_framework.response import Response
from rest_framework.views import APIView
from teams.views import InvitationDetailView, AcceptInvitationView

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'Team Task Tracker API',
            'database': 'MongoDB',
            'version': '1.0.0'
        })

urlpatterns = [
    path('api/health/', HealthCheckView.as_view(), name='health_check'),
    path('api/auth/', include('authentication.urls')),
    path('api/teams/', include('teams.urls')),
    path('api/invitations/<str:token>/', InvitationDetailView.as_view(), name='invitation_detail'),
    path('api/invitations/<str:token>/accept/', AcceptInvitationView.as_view(), name='invitation_accept'),
    path('api/', include('tasks.urls')),
    path('api/', include('activity.urls')),
]
