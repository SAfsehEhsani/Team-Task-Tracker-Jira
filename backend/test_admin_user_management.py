import os
import sys
import django
import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

# Setup django environment for MongoDB checks
sys.path.insert(0, os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import User

def main():
    print("=======================================================")
    print("TEST: REAL USER REGISTRATION, PERSISTENCE & ADMIN CRUD")
    print("=======================================================")

    # 1. Register a real brand new user
    real_email = 'rohit_kumar@realtest.com'
    real_pass = 'RohitPassword2026!'
    User.objects(email=real_email).delete()

    print("\n--- TEST 1: Register New User with Custom Credentials ---")
    reg_res = requests.post(f'{BASE_URL}/auth/register/', json={
        'name': 'Rohit Kumar',
        'email': real_email,
        'password': real_pass,
        'role': 'Member'
    })
    assert reg_res.status_code == 201, f'Registration failed: {reg_res.text}'
    reg_data = reg_res.json()
    print('[PASS] User registered successfully:')
    print(f"       Name: {reg_data['user']['name']}, Email: {reg_data['user']['email']}, Role: {reg_data['user']['role']}")
    rohit_id = reg_data['user']['id']

    # 2. Login next time with the SAME credentials
    print("\n--- TEST 2: Login with Same Credentials ---")
    login_res = requests.post(f'{BASE_URL}/auth/login/', json={
        'email': real_email,
        'password': real_pass
    })
    assert login_res.status_code == 200, f'Login failed: {login_res.text}'
    login_data = login_res.json()
    assert 'tokens' in login_data
    assert login_data['user']['last_login'] is not None, 'last_login was not set!'
    print(f"[PASS] Successfully logged in! last_login recorded: {login_data['user']['last_login']}")

    # 3. Admin logs in and checks User Directory
    print("\n--- TEST 3: Admin Views All Users & Last Login Timestamps ---")
    admin_login_res = requests.post(f'{BASE_URL}/auth/login/', json={
        'email': 'admin@tasktracker.io',
        'password': 'Password123!'
    })
    assert admin_login_res.status_code == 200, f'Admin login failed: {admin_login_res.text}'
    admin_token = admin_login_res.json()['tokens']['access']
    admin_id = admin_login_res.json()['user']['id']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}

    users_res = requests.get(f'{BASE_URL}/auth/users/', headers=admin_headers)
    assert users_res.status_code == 200, f'Fetch users failed: {users_res.text}'
    users_list = users_res.json()['users']
    print(f'[PASS] Admin retrieved {len(users_list)} registered users from MongoDB.')

    # Verify Rohit is in the list with his last_login
    rohit_record = next((u for u in users_list if u['email'] == real_email), None)
    assert rohit_record is not None, f'{real_email} not found in user directory'
    print(f"[PASS] User record found in Admin Directory: {rohit_record['name']} | Last Login: {rohit_record['last_login']}")

    # 4. Admin adds a user directly
    print("\n--- TEST 4: Admin Adds New User Directly (Add Option) ---")
    priya_email = 'priya_sharma@realtest.com'
    priya_pass = 'PriyaPass2026!'
    User.objects(email=priya_email).delete()

    add_res = requests.post(f'{BASE_URL}/auth/users/', json={
        'name': 'Priya Sharma',
        'email': priya_email,
        'password': priya_pass,
        'role': 'Member'
    }, headers=admin_headers)
    assert add_res.status_code == 201, f'Admin add user failed: {add_res.text}'
    priya_data = add_res.json()['user']
    priya_id = priya_data['id']
    print(f"[PASS] Admin successfully added user {priya_data['name']} (ID: {priya_id})")

    # Verify Priya can log in with credentials set by Admin
    priya_login_res = requests.post(f'{BASE_URL}/auth/login/', json={
        'email': priya_email,
        'password': priya_pass
    })
    assert priya_login_res.status_code == 200, f'Priya login failed: {priya_login_res.text}'
    print(f"[PASS] Priya successfully logged in with Admin-created credentials.")

    # 5. Admin edits Priya (Edit Option)
    print("\n--- TEST 5: Admin Edits User Name and Promotes Role to Admin (Edit Option) ---")
    edit_res = requests.patch(f'{BASE_URL}/auth/users/{priya_id}/', json={
        'name': 'Priya Sharma (Lead)',
        'role': 'Admin'
    }, headers=admin_headers)
    assert edit_res.status_code == 200, f'Admin edit user failed: {edit_res.text}'
    updated_priya = edit_res.json()['user']
    assert updated_priya['name'] == 'Priya Sharma (Lead)'
    assert updated_priya['role'] == 'Admin'
    print(f"[PASS] User updated: Name: {updated_priya['name']}, Role: {updated_priya['role']}")

    # 6. Admin deletes user (Remove Option)
    print("\n--- TEST 6: Admin Deletes User (Remove Option) ---")
    del_res = requests.delete(f'{BASE_URL}/auth/users/{rohit_id}/', headers=admin_headers)
    assert del_res.status_code == 200, f'Admin delete user failed: {del_res.text}'
    print(f"[PASS] User {rohit_id} deleted: {del_res.json()['message']}")

    # Confirm Rohit can no longer log in
    deleted_login_res = requests.post(f'{BASE_URL}/auth/login/', json={
        'email': real_email,
        'password': real_pass
    })
    assert deleted_login_res.status_code == 400, 'Deleted user should not be able to log in'
    print("[PASS] Deleted user correctly denied login.")

    # 7. Admin cannot delete their own account
    print("\n--- TEST 7: Safety Check: Admin Cannot Delete Own Account ---")
    self_del_res = requests.delete(f'{BASE_URL}/auth/users/{admin_id}/', headers=admin_headers)
    assert self_del_res.status_code == 400, 'Admin deleting self should fail'
    print(f"[PASS] Self-deletion correctly blocked: {self_del_res.json()['error']}")

    print("\n=======================================================")
    print("ALL 7 REAL USER PERSISTENCE & ADMIN CRUD TESTS PASSED!")
    print("=======================================================")

if __name__ == '__main__':
    main()
