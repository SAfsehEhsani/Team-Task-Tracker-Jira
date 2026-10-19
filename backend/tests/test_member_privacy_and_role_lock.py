import os
import sys
import django
import requests

BASE_URL = 'http://127.0.0.1:8000/api'

sys.path.insert(0, os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import User

def main():
    print("================================================================")
    print("TEST: MEMBER PRIVACY, ROLE LOCK & STRICT ADMIN-ONLY PRIVILEGES")
    print("================================================================")

    # 1. Test public self-registration attempting to become Admin
    print("\n--- TEST 1: Public Registration Cannot Create Admin ---")
    member_email = 'privacy_test_member@tasktracker.test'
    member_pass = 'MemberPass123!'
    User.objects(email=member_email).delete()

    # Even if malicious actor attempts to pass role='Admin'
    reg_res = requests.post(f'{BASE_URL}/auth/register/', json={
        'name': 'Sneaky Member',
        'email': member_email,
        'password': member_pass,
        'role': 'Admin'  # Attempting self-promotion
    })
    assert reg_res.status_code == 201, f'Registration failed: {reg_res.text}'
    created_user = reg_res.json()['user']
    print(f"Registered user role returned: {created_user['role']}")
    assert created_user['role'] == 'Member', f"Security failure! Role was set to {created_user['role']} instead of Member"
    member_tokens = reg_res.json()['tokens']
    member_id = created_user['id']
    member_headers = {'Authorization': f'Bearer {member_tokens["access"]}'}
    print("[PASS] Public registration strictly forced role to 'Member'.")

    # 2. Member CANNOT view other members directory
    print("\n--- TEST 2: Member Cannot View Users Directory (403 Forbidden) ---")
    users_dir_res = requests.get(f'{BASE_URL}/auth/users/', headers=member_headers)
    print(f"Member GET /api/auth/users/ response: {users_dir_res.status_code}")
    assert users_dir_res.status_code == 403, f"Member should be blocked from user directory! Got {users_dir_res.status_code}"
    print("[PASS] Member blocked from viewing other users directory.")

    # 3. Member CANNOT self-promote or edit their own or any other user's role
    print("\n--- TEST 3: Member Cannot Change Role to Admin (403 Forbidden) ---")
    edit_role_res = requests.patch(f'{BASE_URL}/auth/users/{member_id}/', json={
        'role': 'Admin'
    }, headers=member_headers)
    print(f"Member PATCH role response: {edit_role_res.status_code}")
    assert edit_role_res.status_code == 403, f"Member should be forbidden from editing roles! Got {edit_role_res.status_code}"
    print("[PASS] Member blocked from changing role.")

    # 4. Member CANNOT create new users
    print("\n--- TEST 4: Member Cannot Create Other Users (403 Forbidden) ---")
    create_user_res = requests.post(f'{BASE_URL}/auth/users/', json={
        'name': 'Unauthorized User',
        'email': 'unauth@test.com',
        'password': 'Password123!',
        'role': 'Admin'
    }, headers=member_headers)
    assert create_user_res.status_code == 403, f"Member should be forbidden from creating users! Got {create_user_res.status_code}"
    print("[PASS] Member blocked from creating users.")

    # 5. Member CANNOT delete any users
    print("\n--- TEST 5: Member Cannot Delete Users (403 Forbidden) ---")
    delete_user_res = requests.delete(f'{BASE_URL}/auth/users/{member_id}/', headers=member_headers)
    assert delete_user_res.status_code == 403, f"Member should be forbidden from deleting users! Got {delete_user_res.status_code}"
    print("[PASS] Member blocked from deleting users.")

    # 6. Admin CAN view, manage, and promote roles
    print("\n--- TEST 6: Real Admin CAN View Directory and Manage Roles ---")
    admin_login_res = requests.post(f'{BASE_URL}/auth/login/', json={
        'email': 'admin@tasktracker.io',
        'password': 'Password123!'
    })
    assert admin_login_res.status_code == 200, f'Admin login failed: {admin_login_res.text}'
    admin_tokens = admin_login_res.json()['tokens']
    admin_headers = {'Authorization': f'Bearer {admin_tokens["access"]}'}

    admin_dir_res = requests.get(f'{BASE_URL}/auth/users/', headers=admin_headers)
    assert admin_dir_res.status_code == 200, f"Admin should be able to view directory! Got {admin_dir_res.status_code}"
    print(f"[PASS] Admin successfully accessed directory with {len(admin_dir_res.json()['users'])} users.")

    # Admin promotes the member
    admin_promote_res = requests.patch(f'{BASE_URL}/auth/users/{member_id}/', json={
        'role': 'Admin'
    }, headers=admin_headers)
    assert admin_promote_res.status_code == 200, f"Admin role update failed: {admin_promote_res.text}"
    promoted_user = admin_promote_res.json()['user']
    assert promoted_user['role'] == 'Admin'
    print(f"[PASS] Admin successfully promoted {promoted_user['name']} to Admin.")

    print("\n================================================================")
    print("ALL 6 SECURITY & PRIVACY VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("================================================================")

if __name__ == '__main__':
    main()
