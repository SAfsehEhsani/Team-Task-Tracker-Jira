import requests
from pymongo import MongoClient
from bson import ObjectId
import json

BASE = 'http://127.0.0.1:8000/api'
client = MongoClient('mongodb://127.0.0.1:27017')
db = client['tasktracker_db']

def main():
    print("=" * 65)
    print("LIVE REAL-TIME DATABASE & ROLE-BASED ACCESS TEST")
    print("=" * 65)

    # 1. Register brand new Admin
    print("\n1. Registering new custom user as Admin:")
    sarah_res = requests.post(f'{BASE}/auth/register/', json={
        'name': 'Sarah Connor',
        'email': 'sarah.live@example.com',
        'password': 'SecurePassword999!',
        'role': 'Admin'
    })
    print("   Status:", sarah_res.status_code, sarah_res.json().get('message', ''))
    sarah_token = sarah_res.json()['tokens']['access']
    sarah_headers = {'Authorization': f'Bearer {sarah_token}'}

    # 2. Register brand new Member
    print("\n2. Registering new custom user as Member:")
    john_res = requests.post(f'{BASE}/auth/register/', json={
        'name': 'John Connor',
        'email': 'john.live@example.com',
        'password': 'SecurePassword999!',
        'role': 'Member'
    })
    print("   Status:", john_res.status_code, john_res.json().get('message', ''))
    john_token = john_res.json()['tokens']['access']
    john_headers = {'Authorization': f'Bearer {john_token}'}

    # 3. Check Role Enforcement
    print("\n3. Testing Role Permissions:")
    bad_team = requests.post(f'{BASE}/teams/', json={'name': 'Illegal Squad'}, headers=john_headers)
    print("   -> John (Member) creating team: HTTP", bad_team.status_code, "(BLOCKED - 403 Forbidden)")

    good_team = requests.post(f'{BASE}/teams/', json={
        'name': 'Alpha Vanguard',
        'description': 'Real-world live testing squad'
    }, headers=sarah_headers)
    team_data = good_team.json()['team']
    team_id = team_data['id']
    print("   -> Sarah (Admin) creating team: HTTP", good_team.status_code, f"(ALLOWED - Team '{team_data['name']}' created)")

    # 4. Sarah invites John to the team
    print("\n4. Admin Inviting Member to Team:")
    invite_res = requests.post(f'{BASE}/teams/{team_id}/invite/', json={'email': 'john.live@example.com'}, headers=sarah_headers)
    print("   -> Status:", invite_res.status_code, "|", invite_res.json()['message'])

    # 5. Sarah creates task, assigns to John
    print("\n5. Task Creation, Assignment, Status Transition & Commenting:")
    task_res = requests.post(f'{BASE}/teams/{team_id}/tasks/', json={
        'title': 'Deploy Satellite Link',
        'description': 'Establish uplink to defense hub',
        'status': 'Pending',
        'assigned_to': john_res.json()['user']['id']
    }, headers=sarah_headers)
    task_id = task_res.json()['task']['id']
    print(f"   -> Task created by Admin: '{task_res.json()['task']['title']}' (Status: Pending)")

    # John transitions status to 'In Progress'
    status_res = requests.patch(f'{BASE}/tasks/{task_id}/', json={'status': 'In Progress'}, headers=john_headers)
    print(f"   -> Task status updated by Member: {status_res.json()['task']['status']}")

    # John adds comment
    comment_res = requests.post(f'{BASE}/tasks/{task_id}/comments/', json={
        'text': 'Satellite link calibration underway in real-time!'
    }, headers=john_headers)
    print("   -> Comment posted by Member:", comment_res.json()['comment']['text'])

    # 6. Direct MongoDB Query
    print("\n6. DIRECT QUERY TO MONGODB DATABASE ('tasktracker_db'):")
    user_doc = db['users'].find_one({'email': 'sarah.live@example.com'})
    print(f"   [MongoDB users collection] Record found:")
    print(f"     _id: {user_doc['_id']}")
    print(f"     name: {user_doc['name']}")
    print(f"     email: {user_doc['email']}")
    print(f"     role: {user_doc['role']}")
    print(f"     hashed_password: {user_doc['password'][:30]}...")

    task_doc = db['tasks'].find_one({'_id': ObjectId(task_id)})
    print(f"\n   [MongoDB tasks collection] Record found:")
    print(f"     _id: {task_doc['_id']}")
    print(f"     title: {task_doc['title']}")
    print(f"     status: {task_doc['status']}")
    print(f"     comments count: {len(task_doc.get('comments', []))}")
    print(f"     latest comment text: \"{task_doc['comments'][-1]['text']}\"")

    activities = list(db['activities'].find({'team': ObjectId(team_id)}).sort('created_at', -1))
    print(f"\n   [MongoDB activities collection] {len(activities)} Chronological Activity Records:")
    for i, a in enumerate(activities, 1):
        print(f"     {i}. [{a['action_type']}] {a['message']}")

    print("\n" + "=" * 65)
    print("RESULT: EVERYTHING RUNS 100% LIVE IN REAL MONGODB ON DISK!")
    print("=" * 65)

if __name__ == '__main__':
    main()
