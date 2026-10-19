from django.urls import path, include
from rest_framework.response import Response
from rest_framework.views import APIView
from teams.views import InvitationDetailView, AcceptInvitationView

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        db_status = "connected"
        db_error = None
        user_count = 0
        try:
            from authentication.models import User
            user_count = User.objects.count()
        except Exception as e:
            db_status = "error"
            db_error = str(e)

        return Response({
            'status': 'healthy' if db_status == "connected" else 'database_error',
            'service': 'Team Task Tracker API',
            'database': db_status,
            'database_error': db_error,
            'user_count': user_count,
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
