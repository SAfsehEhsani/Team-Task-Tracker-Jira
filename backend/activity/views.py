from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from activity.models import Activity
from teams.models import Team
from authentication.permissions import IsAuthenticatedCustom

class TeamTimelineView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request, team_id):
        try:
            team = Team.objects.get(id=ObjectId(team_id))
        except (Team.DoesNotExist, Exception):
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if not team.is_member(request.user):
            return Response({'error': 'You do not have access to this team timeline'}, status=status.HTTP_403_FORBIDDEN)

        try:
            limit = int(request.query_params.get('limit', 50))
        except ValueError:
            limit = 50

        # Ordered by most recent first
        activities = Activity.objects(team=team).order_by('-created_at')[:limit]

        return Response({
            'team_id': str(team.id),
            'team_name': team.name,
            'activities': [a.to_dict() for a in activities],
            'count': len(activities)
        }, status=status.HTTP_200_OK)
