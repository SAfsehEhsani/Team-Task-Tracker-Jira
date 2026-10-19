import os
import django
from django.test import SimpleTestCase
from rest_framework.test import APIClient
from rest_framework import status
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import User
from teams.models import Team
from tasks.models import Task
from activity.models import Activity

class TaskTrackerAPITests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = APIClient()

    def test_01_health_check(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')

    def test_02_login_and_jwt_tokens(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'admin@tasktracker.io',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['role'], 'Admin')

    def test_03_member_cannot_create_team(self):
        # Login as member (Alice)
        login_res = self.client.post('/api/auth/login/', {
            'email': 'alice@tasktracker.io',
            'password': 'Password123!'
        }, format='json')
        token = login_res.data['tokens']['access']

        member_client = APIClient()
        member_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = member_client.post('/api/teams/', {
            'name': 'Unauthorized Team',
            'description': 'Should fail'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_04_admin_can_create_team_and_invite(self):
        # Login as Admin
        login_res = self.client.post('/api/auth/login/', {
            'email': 'admin@tasktracker.io',
            'password': 'Password123!'
        }, format='json')
        admin_token = login_res.data['tokens']['access']

        admin_client = APIClient()
        admin_client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

        # Create team
        res = admin_client.post('/api/teams/', {
            'name': 'DevOps Squad',
            'description': 'Cloud pipelines and deployments'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        team_id = res.data['team']['id']

        # Invite member
        invite_res = admin_client.post(f'/api/teams/{team_id}/invite/', {
            'email': 'alice@tasktracker.io'
        }, format='json')
        self.assertEqual(invite_res.status_code, status.HTTP_200_OK)

        # Create task in new team
        task_res = admin_client.post(f'/api/teams/{team_id}/tasks/', {
            'title': 'Configure CI/CD Pipeline',
            'description': 'Setup GitHub Actions for auto deployment',
            'status': 'Pending'
        }, format='json')
        self.assertEqual(task_res.status_code, status.HTTP_201_CREATED)
        task_id = task_res.data['task']['id']

        # Update task status to "In Progress"
        update_res = admin_client.patch(f'/api/tasks/{task_id}/', {
            'status': 'In Progress'
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['task']['status'], 'In Progress')

        # Add comment
        comment_res = admin_client.post(f'/api/tasks/{task_id}/comments/', {
            'text': 'Initial workflow yaml is drafted.'
        }, format='json')
        self.assertEqual(comment_res.status_code, status.HTTP_201_CREATED)

        # Check activity timeline
        timeline_res = admin_client.get(f'/api/teams/{team_id}/timeline/')
        self.assertEqual(timeline_res.status_code, status.HTTP_200_OK)
        activities = timeline_res.data['activities']
        self.assertGreaterEqual(len(activities), 3)

        # Check example message pattern: 'Saumyakanta changed status of "Configure CI/CD Pipeline" to In Progress.'
        status_activity = next(a for a in activities if a['action_type'] == 'status_changed')
        self.assertIn('changed status of "Configure CI/CD Pipeline" to In Progress.', status_activity['message'])

if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    import sys
    sys.argv = ['manage.py', 'test', 'tests_api']
    execute_from_command_line(sys.argv)
