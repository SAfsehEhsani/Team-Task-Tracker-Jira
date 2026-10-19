from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
import mongoengine.errors

from authentication.serializers import RegisterSerializer, LoginSerializer, RefreshTokenSerializer, UserSerializer
from authentication.utils import generate_tokens
from authentication.permissions import IsAuthenticatedCustom, IsAdminUserRole
from authentication.models import User
from teams.models import Team, TeamInvitation
from tasks.models import Task
from activity.models import Activity

class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                user.last_login = datetime.utcnow()
                user.save()
                tokens = generate_tokens(user)
                return Response({
                    'message': 'Registration successful',
                    'user': user.to_dict(),
                    'tokens': tokens
                }, status=status.HTTP_201_CREATED)
            except mongoengine.errors.NotUniqueError:
                return Response({'email': ['A user with this email already exists.']}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user.last_login = datetime.utcnow()
            user.save()
            tokens = generate_tokens(user)
            return Response({
                'message': 'Login successful',
                'user': user.to_dict(),
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RefreshTokenView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = generate_tokens(user)
            return Response({
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def get(self, request):
        return Response({
            'user': request.user.to_dict()
        }, status=status.HTTP_200_OK)

class UsersListCreateView(APIView):
    permission_classes = [IsAuthenticatedCustom, IsAdminUserRole]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if query:
            users = User.objects(
                mongoengine.Q(name__icontains=query) | mongoengine.Q(email__icontains=query)
            ).order_by('-created_at')[:50]
        else:
            users = User.objects.order_by('-created_at')[:100]

        users_data = []
        for u in users:
            d = u.to_dict()
            try:
                # Count teams member belongs to
                d['teams_count'] = Team.objects(members=u).count()
            except Exception:
                d['teams_count'] = 0
            users_data.append(d)

        return Response({
            'users': users_data,
            'count': len(users_data)
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Admin creates a new user directly."""
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can add new users directly.'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        role = request.data.get('role', 'Member')

        if not name:
            return Response({'name': ['Full name is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if not email:
            return Response({'email': ['Email address is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if not password or len(password) < 6:
            return Response({'password': ['Password must be at least 6 characters.']}, status=status.HTTP_400_BAD_REQUEST)
        if role not in ['Admin', 'Member']:
            return Response({'role': ['Role must be either Admin or Member.']}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects(email=email).first():
            return Response({'email': ['A user with this email already exists.']}, status=status.HTTP_400_BAD_REQUEST)

        user = User(
            name=name,
            email=email,
            role=role,
            created_at=datetime.utcnow()
        )
        user.set_password(password)
        user.save()

        return Response({
            'message': f'User {user.name} created successfully.',
            'user': user.to_dict()
        }, status=status.HTTP_201_CREATED)

class UserDetailAdminView(APIView):
    permission_classes = [IsAuthenticatedCustom, IsAdminUserRole]

    def patch(self, request, user_id):
        """Admin edits a user's name, email, role, or resets password."""
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can edit users.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(id=ObjectId(user_id))
        except (User.DoesNotExist, Exception):
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        email = request.data.get('email')
        role = request.data.get('role')
        password = request.data.get('password')

        if name:
            user.name = name.strip()

        if email and email.strip().lower() != user.email:
            new_email = email.strip().lower()
            if User.objects(email=new_email).first():
                return Response({'email': ['This email is already in use by another account.']}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email

        if role:
            if role not in ['Admin', 'Member']:
                return Response({'role': ['Role must be either Admin or Member.']}, status=status.HTTP_400_BAD_REQUEST)
            user.role = role

        if password:
            if len(password) < 6:
                return Response({'password': ['Password must be at least 6 characters.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(password)

        user.save()

        return Response({
            'message': f'User {user.name} updated successfully.',
            'user': user.to_dict()
        }, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        """Admin removes a user from database and all teams."""
        if request.user.role != 'Admin':
            return Response({'error': 'Only Admins can delete users.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user = User.objects.get(id=ObjectId(user_id))
        except (User.DoesNotExist, Exception):
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if str(target_user.id) == str(request.user.id):
            return Response({'error': 'You cannot delete your own logged-in Admin account.'}, status=status.HTTP_400_BAD_REQUEST)

        # Remove from all teams
        user_teams = Team.objects(members=target_user)
        for t in user_teams:
            t.members = [m for m in t.members if m and str(m.id) != str(target_user.id)]
            t.save()

        deleted_name = target_user.name
        deleted_email = target_user.email
        target_user.delete()

        return Response({
            'message': f'User {deleted_name} ({deleted_email}) was permanently removed.',
            'user_id': user_id
        }, status=status.HTTP_200_OK)

class DatabaseInspectorView(APIView):
    """Admin-only inspector that dumps live MongoDB collections in structured JSON format."""
    permission_classes = [IsAuthenticatedCustom, IsAdminUserRole]

    def get(self, request):
        users_data = [u.to_dict() for u in User.objects().order_by('-created_at')]
        teams_data = [t.to_dict() for t in Team.objects().order_by('-created_at')]
        tasks_data = [t.to_dict() for t in Task.objects().order_by('-created_at')]
        activities_data = [a.to_dict() for a in Activity.objects().order_by('-created_at').limit(150)]
        invitations_data = [i.to_dict() for i in TeamInvitation.objects().order_by('-created_at')]

        return Response({
            'database': 'tasktracker_db',
            'engine': 'MongoEngine ODM',
            'status': 'connected',
            'counts': {
                'users': len(users_data),
                'teams': len(teams_data),
                'tasks': len(tasks_data),
                'activities': len(activities_data),
                'invitations': len(invitations_data),
                'total_documents': len(users_data) + len(teams_data) + len(tasks_data) + len(activities_data) + len(invitations_data)
            },
            'collections': {
                'users': users_data,
                'teams': teams_data,
                'tasks': tasks_data,
                'activities': activities_data,
                'invitations': invitations_data
            }
        }, status=status.HTTP_200_OK)

