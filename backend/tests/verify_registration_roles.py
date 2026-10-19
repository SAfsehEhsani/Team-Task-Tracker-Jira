import os
import sys
import requests

BASE_URL = 'http://127.0.0.1:8000/api'

def test_registration_roles():
    print("Testing Registration with Admin & Member Role Choices...")
    
    # Clean up test users first if they exist
    from mongoengine import connect
    import mongoengine
    import time
    
    admin_payload = {
        'name': 'Test New Admin',
        'email': f'newadmin_{int(time.time())}@example.com',
        'password': 'Password123!',
        'role': 'Admin'
    }
    
    member_payload = {
        'name': 'Test New Member',
        'email': f'newmember_{int(time.time())}@example.com',
        'password': 'Password123!',
        'role': 'Member'
    }
    
    # 1. Register Admin
    r1 = requests.post(f'{BASE_URL}/auth/register/', json=admin_payload)
    print("Admin Registration Response:", r1.status_code, r1.json().get('user', {}).get('role'))
    assert r1.status_code == 201, f"Expected 201, got {r1.status_code}: {r1.text}"
    admin_user = r1.json()['user']
    assert admin_user['role'] == 'Admin', f"Expected Admin, got {admin_user['role']}"
    
    # 2. Register Member
    r2 = requests.post(f'{BASE_URL}/auth/register/', json=member_payload)
    print("Member Registration Response:", r2.status_code, r2.json().get('user', {}).get('role'))
    assert r2.status_code == 201, f"Expected 201, got {r2.status_code}: {r2.text}"
    member_user = r2.json()['user']
    assert member_user['role'] == 'Member', f"Expected Member, got {member_user['role']}"
    
    # 3. Test Login for New Admin
    l1 = requests.post(f'{BASE_URL}/auth/login/', json={'email': admin_payload['email'], 'password': admin_payload['password']})
    assert l1.status_code == 200, f"Expected 200, got {l1.status_code}"
    assert l1.json()['user']['role'] == 'Admin'
    admin_token = l1.json()['tokens']['access']
    print("New Admin Login Successful! Role:", l1.json()['user']['role'])
    
    # 4. Verify Admin has access to /auth/users/
    u1 = requests.get(f'{BASE_URL}/auth/users/', headers={'Authorization': f'Bearer {admin_token}'})
    assert u1.status_code == 200, f"Expected 200 for Admin, got {u1.status_code}"
    print("New Admin has full access to /auth/users/ API (Status: 200)")
    
    # 5. Test Login for New Member
    l2 = requests.post(f'{BASE_URL}/auth/login/', json={'email': member_payload['email'], 'password': member_payload['password']})
    assert l2.status_code == 200, f"Expected 200, got {l2.status_code}"
    assert l2.json()['user']['role'] == 'Member'
    member_token = l2.json()['tokens']['access']
    print("New Member Login Successful! Role:", l2.json()['user']['role'])
    
    # 6. Verify Member is 403 Forbidden from /auth/users/
    u2 = requests.get(f'{BASE_URL}/auth/users/', headers={'Authorization': f'Bearer {member_token}'})
    assert u2.status_code == 403, f"Expected 403 for Member, got {u2.status_code}"
    print("New Member correctly blocked with 403 Forbidden from /auth/users/ API")
    
    print("\nALL REGISTRATION AND ROLE PERSISTENCE TESTS PASSED 100%!")

if __name__ == '__main__':
    test_registration_roles()
