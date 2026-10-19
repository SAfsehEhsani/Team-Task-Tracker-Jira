import os
import sys
import django
import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

# Setup django environment to clean up test data if needed
sys.path.insert(0, os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import User
from teams.models import TeamInvitation, Team

def main():
    print("--- STEP 1: Login as Admin ---")
    login_res = requests.post(f'{BASE_URL}/auth/login/', json={
        'email': 'admin@tasktracker.io',
        'password': 'Password123!'
    })
    assert login_res.status_code == 200, f'Admin login failed: {login_res.text}'
    admin_token = login_res.json()['tokens']['access']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print('[PASS] Admin authenticated successfully.')

    print("\n--- STEP 2: Fetch Admin Teams ---")
    teams_res = requests.get(f'{BASE_URL}/teams/', headers=admin_headers)
    assert teams_res.status_code == 200, f'Get teams failed: {teams_res.text}'
    teams = teams_res.json()['teams']
    assert len(teams) > 0, 'No teams found'
    team = teams[0]
    team_id = team['id']
    team_name = team['name']
    print(f'[PASS] Target team: "{team_name}" (ID: {team_id})')

    print("\n--- STEP 3: Dispatch Invitation for New Email ---")
    test_email = 'syed_new_invitee@tasktracker.test'
    # Clean up prior test user/invitations
    target_team = Team.objects.get(id=team_id)
    target_team.members = [m for m in target_team.members if m and m.email != test_email]
    target_team.save()
    User.objects(email=test_email).delete()
    TeamInvitation.objects(email=test_email).delete()

    invite_res = requests.post(
        f'{BASE_URL}/teams/{team_id}/invite/',
        json={'email': test_email},
        headers=admin_headers
    )
    assert invite_res.status_code == 200, f'Invite failed: {invite_res.text}'
    invite_data = invite_res.json()
    print('[PASS] Invitation response:')
    print(json.dumps(invite_data, indent=2))

    assert 'invite_link' in invite_data, 'Missing invite_link'
    token = invite_data['token']
    join_link = invite_data['invite_link']
    assert f'/join?token={token}' in join_link, f'Invalid join link format: {join_link}'
    print(f'[PASS] Generated Join Link: {join_link}')

    print("\n--- STEP 4: Validate Token on Public Detail Endpoint ---")
    detail_res = requests.get(f'{BASE_URL}/invitations/{token}/')
    assert detail_res.status_code == 200, f'Detail fetch failed: {detail_res.text}'
    detail_data = detail_res.json()
    print('[PASS] Public invitation detail:', json.dumps(detail_data, indent=2))
    assert detail_data['valid'] is True
    assert detail_data['user_exists'] is False
    assert detail_data['email'] == test_email
    assert detail_data['team_name'] == team_name

    print("\n--- STEP 5: Accept Invitation & Create Account with Custom Password ---")
    accept_res = requests.post(f'{BASE_URL}/invitations/{token}/accept/', json={
        'name': 'Syed Member',
        'password': 'MyStrongPassword2026!'
    })
    assert accept_res.status_code == 200, f'Accept failed: {accept_res.text}'
    accept_data = accept_res.json()
    print('[PASS] Invitation accepted:', accept_data['message'])
    new_user_tokens = accept_data['tokens']
    assert 'access' in new_user_tokens
    assert accept_data['user']['role'] == 'Member'
    print(f"[PASS] User created with role: {accept_data['user']['role']}")

    print("\n--- STEP 6: Verify New Member Access to Team Workspace ---")
    new_user_headers = {'Authorization': f'Bearer {new_user_tokens["access"]}'}
    team_check_res = requests.get(f'{BASE_URL}/teams/{team_id}/', headers=new_user_headers)
    assert team_check_res.status_code == 200, f'New member cannot access team: {team_check_res.text}'
    members = team_check_res.json()['team']['members']
    assert any(m['email'] == test_email for m in members), 'New user not in member list'
    print(f'[PASS] User {test_email} is confirmed active member of "{team_name}"!')

    print("\n--- STEP 7: Verify Single-Use Token Protection ---")
    reuse_res = requests.post(f'{BASE_URL}/invitations/{token}/accept/', json={
        'name': 'Syed Member',
        'password': 'MyStrongPassword2026!'
    })
    assert reuse_res.status_code == 400, 'Reusing token should fail'
    print(f'[PASS] Reusing accepted invitation token correctly rejected: {reuse_res.json()}')

    print("\n--- STEP 8: Check Activity Timeline Log ---")
    timeline_res = requests.get(f'{BASE_URL}/teams/{team_id}/timeline/', headers=new_user_headers)
    assert timeline_res.status_code == 200, f'Timeline fetch failed: {timeline_res.text}'
    activities = timeline_res.json()['activities']
    assert any(test_email in a['message'] for a in activities), 'Activity log missing invitation entry'
    print('[PASS] Activity log correctly recorded new member joining via invitation link!')

    print("\n=======================================================")
    print("ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == '__main__':
    main()
