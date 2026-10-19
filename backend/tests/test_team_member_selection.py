import requests
import time

BASE_URL = 'http://127.0.0.1:8000/api'

def test_team_member_selection():
    print("Testing Team Member Selection & Direct Addition...")

    ts = int(time.time())
    admin_creds = {
        'name': f'Project Admin {ts}',
        'email': f'projadmin_{ts}@company.org',
        'password': 'Password123!',
        'role': 'Admin'
    }
    member1_creds = {
        'name': f'Dev Alpha {ts}',
        'email': f'alpha_{ts}@company.org',
        'password': 'Password123!',
        'role': 'Member'
    }
    member2_creds = {
        'name': f'Dev Beta {ts}',
        'email': f'beta_{ts}@company.org',
        'password': 'Password123!',
        'role': 'Member'
    }

    # Register admin and 2 members
    r_admin = requests.post(f'{BASE_URL}/auth/register/', json=admin_creds).json()
    admin_token = r_admin['tokens']['access']
    admin_id = r_admin['user']['id']

    r_m1 = requests.post(f'{BASE_URL}/auth/register/', json=member1_creds).json()
    m1_id = r_m1['user']['id']

    r_m2 = requests.post(f'{BASE_URL}/auth/register/', json=member2_creds).json()
    m2_id = r_m2['user']['id']

    # 1. Admin creates team selecting member1
    team_payload = {
        'name': f'Squad Alpha {ts}',
        'description': 'Squad with selected members',
        'member_ids': [m1_id]
    }
    r_team = requests.post(
        f'{BASE_URL}/teams/',
        json=team_payload,
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert r_team.status_code == 201, f"Expected 201, got {r_team.status_code}: {r_team.text}"
    team_data = r_team.json()['team']
    team_id = team_data['id']
    members_in_team = {m['id'] for m in team_data['members']}
    assert admin_id in members_in_team, "Creator should be in team"
    assert m1_id in members_in_team, "Selected member1 should be in team"
    print(f"  [PASS] Team created with selected initial members ({len(team_data['members'])} members)")

    # 2. Admin directly adds member2 using /add-members/
    r_add = requests.post(
        f'{BASE_URL}/teams/{team_id}/add-members/',
        json={'user_ids': [m2_id]},
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert r_add.status_code == 200, f"Expected 200, got {r_add.status_code}: {r_add.text}"
    updated_members = {m['id'] for m in r_add.json()['team']['members']}
    assert m2_id in updated_members, "Member2 should now be in team"
    print("  [PASS] Direct member addition via /add-members/ successful")

    # 3. Create a task assigned to member2
    task_payload = {
        'title': 'Build Feature X',
        'description': 'Critical milestone task',
        'assigned_to': m2_id
    }
    r_task = requests.post(
        f'{BASE_URL}/teams/{team_id}/tasks/',
        json=task_payload,
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert r_task.status_code == 201, f"Expected 201, got {r_task.status_code}: {r_task.text}"
    task_data = r_task.json()['task']
    assert task_data['assigned_to']['id'] == m2_id
    print(f"  [PASS] Task created and successfully assigned to member: {task_data['assigned_to']['name']}")

    print("\nALL TEAM MEMBER SELECTION AND ASSIGNMENT TESTS PASSED 100%!")

if __name__ == '__main__':
    test_team_member_selection()
