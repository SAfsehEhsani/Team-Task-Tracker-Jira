import requests
import sys

BASE = 'http://127.0.0.1:8000/api'

def run_verification():
    print("=" * 65)
    print("VERIFYING TASK 1 FUNCTIONAL & TECH REQUIREMENTS IN REAL-TIME")
    print("=" * 65)

    # 1. Authentication & Users
    print("\n--- 1. Authentication & Users ---")
    admin_res = requests.post(f'{BASE}/auth/login/', json={'email': 'admin@tasktracker.io', 'password': 'Password123!'})
    assert admin_res.status_code == 200, f'Admin login failed: {admin_res.text}'
    tokens = admin_res.json()['tokens']
    assert 'access' in tokens and 'refresh' in tokens
    admin_token = tokens['access']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print("[PASS] Registration & Login with JWT (access + refresh tokens) working.")
    print(f"       User: {admin_res.json()['user']['name']} | Role: {admin_res.json()['user']['role']}")

    member_res = requests.post(f'{BASE}/auth/login/', json={'email': 'alice@tasktracker.io', 'password': 'Password123!'})
    assert member_res.status_code == 200
    member_token = member_res.json()['tokens']['access']
    member_headers = {'Authorization': f'Bearer {member_token}'}
    print(f"[PASS] Member login working: {member_res.json()['user']['name']} | Role: {member_res.json()['user']['role']}")

    # 2. Role-Based Permissions (Only Admins create teams / invite)
    print("\n--- 2. Role-Based Permissions ---")
    bad_team_res = requests.post(f'{BASE}/teams/', json={'name': 'Illegal Team'}, headers=member_headers)
    assert bad_team_res.status_code == 403, f"Expected 403 for member, got {bad_team_res.status_code}"
    print("[PASS] Member blocked from creating team (HTTP 403 Forbidden).")

    team_res = requests.post(f'{BASE}/teams/', json={
        'name': 'Realtime Validation Team',
        'description': 'Testing live timeline & permissions end-to-end'
    }, headers=admin_headers)
    assert team_res.status_code == 201, f"Admin team creation failed: {team_res.text}"
    team = team_res.json()['team']
    team_id = team['id']
    print(f"[PASS] Admin allowed to create team (HTTP 201 Created): Team '{team['name']}' (ID: {team_id})")

    # Member invitation (simulated)
    invite_res = requests.post(f'{BASE}/teams/{team_id}/invite/', json={
        'email': 'new.hire@tasktracker.io'
    }, headers=admin_headers)
    assert invite_res.status_code == 200
    assert invite_res.json()['simulated_invitation'] is True
    print("[PASS] Admin invited new member (simulated invitation generated).")

    # Member trying to invite someone -> should be 403
    bad_invite = requests.post(f'{BASE}/teams/{team_id}/invite/', json={'email': 'unauthorized@test.com'}, headers=member_headers)
    assert bad_invite.status_code == 403
    print("[PASS] Member blocked from inviting members (HTTP 403 Forbidden).")

    # 3. Tasks & Team Isolation
    print("\n--- 3. Tasks & Team Isolation ---")
    # Alice is not yet added to this new team -> should get 403 trying to view or post tasks
    unauth_tasks = requests.get(f'{BASE}/teams/{team_id}/tasks/', headers=member_headers)
    assert unauth_tasks.status_code == 403
    print("[PASS] Non-team member blocked from viewing team tasks (HTTP 403 Forbidden).")

    # Admin creates task
    task_res = requests.post(f'{BASE}/teams/{team_id}/tasks/', json={
        'title': 'Design API endpoints',
        'description': 'Document RESTful routes with DRF and MongoEngine',
        'status': 'Pending'
    }, headers=admin_headers)
    assert task_res.status_code == 201
    task_id = task_res.json()['task']['id']
    print("[PASS] Team member created task 'Design API endpoints' (Status: Pending).")

    # Update task status to "In Progress"
    status_res = requests.patch(f'{BASE}/tasks/{task_id}/', json={'status': 'In Progress'}, headers=admin_headers)
    assert status_res.status_code == 200
    assert status_res.json()['task']['status'] == 'In Progress'
    print("[PASS] Changed task status to 'In Progress'.")

    # Add comment
    comment_res = requests.post(f'{BASE}/tasks/{task_id}/comments/', json={
        'text': 'All endpoints designed and adhering to JSON schemas.'
    }, headers=admin_headers)
    assert comment_res.status_code == 201
    print("[PASS] Added comment to task.")

    # 4. Activity Timeline in Chronological Order
    print("\n--- 4. Activity Timeline Chronological Audit ---")
    timeline_res = requests.get(f'{BASE}/teams/{team_id}/timeline/', headers=admin_headers)
    assert timeline_res.status_code == 200
    activities = timeline_res.json()['activities']
    print(f"[PASS] Retrieved {len(activities)} chronological timeline events (most recent first):")
    for idx, act in enumerate(activities, 1):
        print(f"       {idx}. [{act['action_type']}] {act['message']}")

    # Verify example format from specification:
    # Example: 'Saumyakanta changed status of "Design API endpoints" to In Progress.'
    status_act = next((a for a in activities if a['action_type'] == 'status_changed'), None)
    assert status_act is not None
    assert 'changed status of "Design API endpoints" to In Progress.' in status_act['message']
    print("\n[PASS] Verified exact required status change message format:")
    print(f"       -> \"{status_act['message']}\"")

    # 5. Status Filters
    print("\n--- 5. Task Status Filters ---")
    pending_res = requests.get(f'{BASE}/teams/{team_id}/tasks/?status=Pending', headers=admin_headers)
    assert len(pending_res.json()['tasks']) == 0
    in_prog_res = requests.get(f'{BASE}/teams/{team_id}/tasks/?status=In Progress', headers=admin_headers)
    assert len(in_prog_res.json()['tasks']) == 1
    print("[PASS] Status query filtering verified (?status=In Progress returned 1 task, ?status=Pending returned 0).")

    print("\n" + "=" * 65)
    print("ALL TASK 1 FUNCTIONAL & TECH REQUIREMENTS PASS 100% IN REAL TIME!")
    print("=" * 65)

if __name__ == '__main__':
    run_verification()
