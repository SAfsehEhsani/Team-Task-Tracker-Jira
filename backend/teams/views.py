import os
import uuid
import secrets
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId

from teams.models import Team, TeamInvitation
from teams.serializers import TeamSerializer, TeamCreateSerializer, InviteMemberSerializer
from authentication.models import User
from authentication.permissions import IsAuthenticatedCustom, IsAdminUserRole
from authentication.utils import generate_tokens
from activity.utils import log_activity
from teams.email_service import send_invitation_email

class TeamListCreateView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        user = request.user
        teams = Team.objects(members=user).order_by('-created_at')
        return Response({
            'teams': [t.to_dict() for t in teams]
        }, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'Admin':
            return Response(
                {'error': 'Permission denied. Only Admins can create new teams.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TeamCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            team = serializer.save()
            log_activity(
                team=team,
                user=request.user,
                action_type='team_created',
                message=f'{request.user.name} created team "{team.name}".'
            )
            return Response({
                'message': 'Team created successfully',
                'team': team.to_dict()
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TeamDetailView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def get_team(self, team_id):
        try:
            return Team.objects.get(id=ObjectId(team_id))
        except (Team.DoesNotExist, Exception):
            return None

    def get(self, request, team_id):
        team = self.get_team(team_id)
        if not team:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if not team.is_member(request.user):
            return Response({'error': 'You do not have access to this team'}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'team': team.to_dict()
        }, status=status.HTTP_200_OK)

    def patch(self, request, team_id):
        team = self.get_team(team_id)
        if not team:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'Admin' or team.created_by.id != request.user.id:
            return Response({'error': 'Only the team Admin can edit team details'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name')
        description = request.data.get('description')
        if name:
            team.name = name.strip()
        if description is not None:
            team.description = description.strip()
        team.save()

        return Response({'message': 'Team updated', 'team': team.to_dict()}, status=status.HTTP_200_OK)

    def delete(self, request, team_id):
        team = self.get_team(team_id)
        if not team:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'Admin' or team.created_by.id != request.user.id:
            return Response({'error': 'Only the team Admin can delete the team'}, status=status.HTTP_403_FORBIDDEN)

        team.delete()
        return Response({'message': 'Team deleted successfully'}, status=status.HTTP_200_OK)

class TeamInviteView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, team_id):
        try:
            team = Team.objects.get(id=ObjectId(team_id))
        except (Team.DoesNotExist, Exception):
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        # Only Admins can invite members
        if request.user.role != 'Admin':
            return Response(
                {'error': 'Permission denied. Only Admins can invite members.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = InviteMemberSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()

        # Check if already a member
        existing_user = User.objects(email=email).first()
        if existing_user and team.is_member(existing_user):
            return Response(
                {'message': f'{existing_user.name} ({email}) is already a member of this team.', 'already_member': True},
                status=status.HTTP_200_OK
            )

        # Generate unique secure invitation token
        token = secrets.token_urlsafe(28)
        now = datetime.utcnow()
        expires_at = now + timedelta(days=7)

        # Create or update invitation record
        invitation = TeamInvitation.objects(team=team, email=email).first()
        if not invitation:
            invitation = TeamInvitation(
                team=team,
                email=email,
                token=token,
                invited_by=request.user,
                expires_at=expires_at,
                status='pending'
            )
        else:
            invitation.token = token
            invitation.expires_at = expires_at
            invitation.status = 'pending'
            invitation.invited_by = request.user
        invitation.save()

        # Construct unique direct join link
        frontend_base = os.environ.get('FRONTEND_URL', 'http://localhost:3000').strip().rstrip('/')
        if frontend_base.endswith('/login'):
            frontend_base = frontend_base[:-6].rstrip('/')
        join_link = f"{frontend_base}/join?token={token}"

        # Dispatch email with join link
        email_result = send_invitation_email(
            recipient_email=email,
            inviter_name=request.user.name,
            team_name=team.name,
            join_url=join_link
        )

        log_activity(
            team=team,
            user=request.user,
            action_type='member_invited',
            message=f'{request.user.name} sent invitation link to {email}.'
        )

        return Response({
            'message': f'Invitation link generated and dispatched to {email}.',
            'invite_link': join_link,
            'token': token,
            'email': email,
            'email_sent': True,
            'email_method': email_result['method'],
            'team': team.to_dict()
        }, status=status.HTTP_200_OK)

class TeamRemoveMemberView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def delete(self, request, team_id, user_id):
        try:
            team = Team.objects.get(id=ObjectId(team_id))
        except (Team.DoesNotExist, Exception):
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can remove members from a team'}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user = User.objects.get(id=ObjectId(user_id))
        except (User.DoesNotExist, Exception):
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if team.created_by.id == target_user.id:
            return Response({'error': 'Cannot remove the creator/Admin of the team'}, status=status.HTTP_400_BAD_REQUEST)

        team.members = [m for m in team.members if m and m.id != target_user.id]
        team.save()

        log_activity(
            team=team,
            user=request.user,
            action_type='member_removed',
            message=f'{request.user.name} removed {target_user.name} from the team.'
        )

        return Response({
            'message': f'{target_user.name} removed from team',
            'team': team.to_dict()
        }, status=status.HTTP_200_OK)

class TeamAddMembersView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, team_id):
        try:
            team = Team.objects.get(id=ObjectId(team_id))
        except (Team.DoesNotExist, Exception):
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can add members to a team'}, status=status.HTTP_403_FORBIDDEN)

        user_ids = request.data.get('user_ids', [])
        if not user_ids:
            return Response({'error': 'user_ids is required'}, status=status.HTTP_400_BAD_REQUEST)

        existing_ids = {str(m.id) for m in team.members if m}
        added_users = []

        for uid in user_ids:
            try:
                target_user = User.objects.get(id=ObjectId(uid))
                if str(target_user.id) not in existing_ids:
                    team.members.append(target_user)
                    existing_ids.add(str(target_user.id))
                    added_users.append(target_user)
            except Exception:
                pass

        if added_users:
            team.save()
            user_names = ", ".join([u.name for u in added_users])
            log_activity(
                team=team,
                user=request.user,
                action_type='member_joined',
                message=f'{request.user.name} added {user_names} to the team.'
            )

        return Response({
            'message': f'Added {len(added_users)} member(s) to team',
            'added_count': len(added_users),
            'team': team.to_dict()
        }, status=status.HTTP_200_OK)

# Public Invitation Link API Views
class InvitationDetailView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, token):
        invitation = TeamInvitation.objects(token=token).first()
        if not invitation:
            return Response({'error': 'Invalid invitation link or token not found.'}, status=status.HTTP_404_NOT_FOUND)

        if invitation.status == 'accepted':
            return Response({
                'valid': False,
                'status': 'accepted',
                'error': 'This invitation has already been accepted.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        user_exists = User.objects(email=invitation.email).first() is not None

        return Response({
            'valid': True,
            'token': invitation.token,
            'email': invitation.email,
            'team_id': str(invitation.team.id),
            'team_name': invitation.team.name,
            'team_description': invitation.team.description,
            'inviter_name': invitation.invited_by.name if invitation.invited_by else 'Team Admin',
            'user_exists': user_exists
        }, status=status.HTTP_200_OK)

class AcceptInvitationView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, token):
        invitation = TeamInvitation.objects(token=token).first()
        if not invitation:
            return Response({'error': 'Invalid invitation link.'}, status=status.HTTP_404_NOT_FOUND)

        if invitation.status == 'accepted':
            return Response({'error': 'This invitation has already been used.'}, status=status.HTTP_400_BAD_REQUEST)

        team = invitation.team
        email = invitation.email

        # Check if user exists
        user = User.objects(email=email).first()

        if not user:
            name = request.data.get('name', '').strip()
            password = request.data.get('password', '')

            if not name:
                return Response({'name': ['Please provide your full name.']}, status=status.HTTP_400_BAD_REQUEST)
            if not password or len(password) < 6:
                return Response({'password': ['Password must be at least 6 characters.']}, status=status.HTTP_400_BAD_REQUEST)

            user = User(
                name=name,
                email=email,
                role='Member'
            )
            user.set_password(password)
            user.save()
        else:
            # Check if caller is already authenticated as this user
            auth_header = request.headers.get('Authorization', '')
            authenticated = False
            if auth_header.startswith('Bearer '):
                try:
                    import jwt
                    from django.conf import settings
                    raw_token = auth_header.split(' ')[1]
                    payload = jwt.decode(raw_token, settings.SECRET_KEY, algorithms=['HS256'])
                    if payload.get('user_id') == str(user.id):
                        authenticated = True
                except Exception:
                    pass

            if not authenticated:
                password = request.data.get('password')
                if not password:
                    return Response({'password': ['Please enter your account password to accept the invitation.']}, status=status.HTTP_400_BAD_REQUEST)
                if not user.check_password(password):
                    return Response({'password': ['Incorrect password for this account.']}, status=status.HTTP_400_BAD_REQUEST)

        # Update last login timestamp
        user.last_login = datetime.utcnow()
        user.save()

        # Add user to team members if not already
        if not team.is_member(user):
            team.members.append(user)
            team.save()

        # Mark invitation as accepted
        invitation.status = 'accepted'
        invitation.save()

        # Record activity
        log_activity(
            team=team,
            user=user,
            action_type='member_invited',
            message=f'{user.name} ({email}) joined team "{team.name}" via invitation link.'
        )

        tokens = generate_tokens(user)

        return Response({
            'message': f'Welcome to team {team.name}!',
            'user': user.to_dict(),
            'tokens': tokens,
            'team_id': str(team.id),
            'team_name': team.name
        }, status=status.HTTP_200_OK)
