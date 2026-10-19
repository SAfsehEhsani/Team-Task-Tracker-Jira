import requests

BASE_URL = 'http://127.0.0.1:8000/api'

def test_database_inspector():
    print("Testing MongoDB Database Inspector API...")

    # 1. Login as Admin
    r_admin = requests.post(f'{BASE_URL}/auth/login/', json={'email': 'admin@tasktracker.io', 'password': 'Password123!'})
    assert r_admin.status_code == 200, "Admin login failed"
    admin_token = r_admin.json()['tokens']['access']

    # 2. Login as Member
    r_member = requests.post(f'{BASE_URL}/auth/login/', json={'email': 'alice@tasktracker.io', 'password': 'Password123!'})
    assert r_member.status_code == 200, "Member login failed"
    member_token = r_member.json()['tokens']['access']

    # 3. Test Admin Access to /api/auth/database-inspector/
    r_inspect = requests.get(
        f'{BASE_URL}/auth/database-inspector/',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    assert r_inspect.status_code == 200, f"Expected 200, got {r_inspect.status_code}: {r_inspect.text}"
    data = r_inspect.json()
    assert data['database'] == 'tasktracker_db'
    assert 'collections' in data
    assert 'users' in data['collections']
    assert 'teams' in data['collections']
    assert 'tasks' in data['collections']
    assert 'activities' in data['collections']
    assert 'invitations' in data['collections']
    print(f"  [PASS] Admin retrieved database dump:")
    print(f"         Total Users: {data['counts']['users']}")
    print(f"         Total Teams: {data['counts']['teams']}")
    print(f"         Total Tasks: {data['counts']['tasks']}")
    print(f"         Total Activities: {data['counts']['activities']}")
    print(f"         Total Invitations: {data['counts']['invitations']}")
    print(f"         Total Documents: {data['counts']['total_documents']}")

    # 4. Verify Member is Forbidden (HTTP 403)
    r_forbidden = requests.get(
        f'{BASE_URL}/auth/database-inspector/',
        headers={'Authorization': f'Bearer {member_token}'}
    )
    assert r_forbidden.status_code == 403, f"Expected 403 for Member, got {r_forbidden.status_code}"
    print("  [PASS] Member correctly blocked with HTTP 403 Forbidden")

    print("\nALL DATABASE INSPECTOR TESTS PASSED 100%!")

if __name__ == '__main__':
    test_database_inspector()
