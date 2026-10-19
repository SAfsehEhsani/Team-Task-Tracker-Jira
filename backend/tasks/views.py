from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from bson import ObjectId
import mongoengine

from tasks.models import Task, TaskComment
from tasks.serializers import (
    TaskSerializer,
    TaskCreateSerializer,
    TaskUpdateSerializer,
    CommentCreateSerializer
)
from teams.models import Team
from authentication.models import User
from authentication.permissions import IsAuthenticatedCustom
from activity.utils import log_activity

class TeamTasksView(APIView):
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
            return Response({'error': 'You do not have access to tasks in this team'}, status=status.HTTP_403_FORBIDDEN)

        # Filters
        query = mongoengine.Q(team=team)

        status_filter = request.query_params.get('status')
        if status_filter and status_filter in Task.STATUS_CHOICES:
            query = query & mongoengine.Q(status=status_filter)

        search = request.query_params.get('search') or request.query_params.get('q')
        if search:
            query = query & (
                mongoengine.Q(title__icontains=search.strip()) |
                mongoengine.Q(description__icontains=search.strip())
            )

        assigned_to = request.query_params.get('assigned_to')
        if assigned_to:
            if assigned_to.lower() == 'me':
                query = query & mongoengine.Q(assigned_to=request.user)
            elif assigned_to.lower() == 'unassigned':
                query = query & mongoengine.Q(assigned_to=None)
            else:
                try:
                    target_user = User.objects.get(id=ObjectId(assigned_to))
                    query = query & mongoengine.Q(assigned_to=target_user)
                except Exception:
                    pass

        tasks = Task.objects(query).order_by('-created_at')
        return Response({
            'tasks': [t.to_dict() for t in tasks],
            'count': tasks.count()
        }, status=status.HTTP_200_OK)

    def post(self, request, team_id):
        team = self.get_team(team_id)
        if not team:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if not team.is_member(request.user):
            return Response({'error': 'Only team members can create tasks'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskCreateSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            assigned_user = validated_data.get('assigned_to')

            # Verify assignee is in team if specified
            if assigned_user and not team.is_member(assigned_user):
                if request.user.role == 'Admin':
                    team.members.append(assigned_user)
                    team.save()
                else:
                    return Response(
                        {'assigned_to': ['Assigned user must be a member of this team.']},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            task = Task(
                title=validated_data['title'].strip(),
                description=validated_data.get('description', '').strip(),
                status=validated_data.get('status', 'Pending'),
                team=team,
                created_by=request.user,
                assigned_to=assigned_user
            )
            task.save()

            # Log activity
            if assigned_user:
                activity_msg = f'{request.user.name} created task "{task.title}" and assigned it to {assigned_user.name}.'
            else:
                activity_msg = f'{request.user.name} created task "{task.title}".'

            log_activity(
                team=team,
                user=request.user,
                action_type='task_created',
                message=activity_msg,
                task=task
            )

            return Response({
                'message': 'Task created successfully',
                'task': task.to_dict()
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskDetailView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def get_task(self, task_id):
        try:
            return Task.objects.get(id=ObjectId(task_id))
        except (Task.DoesNotExist, Exception):
            return None

    def get(self, request, task_id):
        task = self.get_task(task_id)
        if not task:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        if not task.team.is_member(request.user):
            return Response({'error': 'You do not have access to this task'}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'task': task.to_dict()
        }, status=status.HTTP_200_OK)

    def patch(self, request, task_id):
        task = self.get_task(task_id)
        if not task:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        if not task.team.is_member(request.user):
            return Response({'error': 'Only team members can modify tasks'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TaskUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            activities = []

            # Check status change
            if 'status' in validated_data and validated_data['status'] != task.status:
                old_status = task.status
                new_status = validated_data['status']
                task.status = new_status
                # Requirement example: ‘Saumyakanta changed status of “Design API endpoints” to In Progress.’
                msg = f'{request.user.name} changed status of "{task.title}" to {new_status}.'
                activities.append(('status_changed', msg))

            # Check assignee change
            if 'assigned_to' in validated_data:
                new_assigned = validated_data['assigned_to']
                old_assigned_id = str(task.assigned_to.id) if task.assigned_to else None
                new_assigned_id = str(new_assigned.id) if new_assigned else None

                if old_assigned_id != new_assigned_id:
                    if new_assigned and not task.team.is_member(new_assigned):
                        if request.user.role == 'Admin':
                            task.team.members.append(new_assigned)
                            task.team.save()
                        else:
                            return Response(
                                {'assigned_to': ['Assigned user must be a member of this team.']},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    task.assigned_to = new_assigned
                    if new_assigned:
                        msg = f'{request.user.name} assigned "{task.title}" to {new_assigned.name}.'
                    else:
                        msg = f'{request.user.name} unassigned "{task.title}".'
                    activities.append(('task_assigned', msg))

            # Check title change
            if 'title' in validated_data and validated_data['title'].strip() != task.title:
                old_title = task.title
                new_title = validated_data['title'].strip()
                task.title = new_title
                msg = f'{request.user.name} renamed task "{old_title}" to "{new_title}".'
                activities.append(('task_updated', msg))

            # Check description change
            if 'description' in validated_data and validated_data['description'].strip() != task.description:
                task.description = validated_data['description'].strip()
                if not activities:
                    msg = f'{request.user.name} updated description for "{task.title}".'
                    activities.append(('task_updated', msg))

            task.updated_at = datetime.utcnow()
            task.save()

            # Record activities
            for action_type, message in activities:
                log_activity(
                    team=task.team,
                    user=request.user,
                    action_type=action_type,
                    message=message,
                    task=task
                )

            return Response({
                'message': 'Task updated successfully',
                'task': task.to_dict()
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, task_id):
        task = self.get_task(task_id)
        if not task:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        if not task.team.is_member(request.user):
            return Response({'error': 'You do not have access to this task'}, status=status.HTTP_403_FORBIDDEN)

        team = task.team
        task_title = task.title
        task.delete()

        log_activity(
            team=team,
            user=request.user,
            action_type='task_deleted',
            message=f'{request.user.name} deleted task "{task_title}".'
        )

        return Response({
            'message': f'Task "{task_title}" deleted successfully'
        }, status=status.HTTP_200_OK)

class TaskCommentView(APIView):
    permission_classes = [IsAuthenticatedCustom]

    def post(self, request, task_id):
        try:
            task = Task.objects.get(id=ObjectId(task_id))
        except (Task.DoesNotExist, Exception):
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        if not task.team.is_member(request.user):
            return Response({'error': 'Only team members can comment on tasks'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            text = serializer.validated_data['text'].strip()
            comment = TaskComment(
                user=request.user,
                user_name=request.user.name,
                text=text,
                created_at=datetime.utcnow()
            )
            task.comments.append(comment)
            task.updated_at = datetime.utcnow()
            task.save()

            # Requirement: Every time a task is commented on, an activity entry should be added to chronological timeline.
            text_preview = text if len(text) <= 50 else text[:47] + '...'
            log_activity(
                team=task.team,
                user=request.user,
                action_type='comment_added',
                message=f'{request.user.name} commented on "{task.title}": "{text_preview}"',
                task=task
            )

            return Response({
                'message': 'Comment added successfully',
                'comment': comment.to_dict(),
                'task': task.to_dict()
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
