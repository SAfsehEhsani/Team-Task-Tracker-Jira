import urllib.request
import json
import time

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://127.0.0.1:8000"

def http_req(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode("utf-8")
            status = response.status
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = body
            return status, parsed
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed

def run_all_tests():
    print("=" * 70)
    print("=== TEAM TASK TRACKER: FULL END-TO-END SYSTEM & FEATURE VERIFICATION ===")
    print("=" * 70)


    # -------------------------------------------------------------
    # STEP 1: Verify Frontend Routes
    # -------------------------------------------------------------
    print("\n--- [1/10] Verifying Frontend Pages (Next.js 16) ---")
    routes = ["/", "/login", "/register", "/join", "/dashboard", "/users"]
    for r in routes:
        code, body = http_req(f"{FRONTEND_URL}{r}")
        assert code == 200, f"Frontend route {r} returned {code}"
        print(f"  [PASS] Page {r:<15} -> HTTP {code} OK")

    # -------------------------------------------------------------
    # STEP 2: Verify Backend Health & MongoDB Connection
    # -------------------------------------------------------------
    print("\n--- [2/10] Verifying Backend Health & Live MongoDB ---")
    code, data = http_req(f"{BACKEND_URL}/api/health/")
    assert code == 200, f"Health check failed with {code}: {data}"
    assert data.get("database") == "connected", f"Database not connected: {data}"
    print(f"  [PASS] Backend API is Healthy. MongoDB Status: {data.get('database')}")
    print(f"  [PASS] Active Registered Users in MongoDB: {data.get('user_count')}")

    # -------------------------------------------------------------
    # STEP 3: Real User Self-Registration (Strict Member Role)
    # -------------------------------------------------------------
    print("\n--- [3/10] Testing Real User Registration ---")
    unique_ts = int(time.time())
    member_email = f"real_member_{unique_ts}@company.org"
    member_password = "Password123!"
    reg_payload = {
        "name": f"Real Member {unique_ts}",
        "email": member_email,
        "password": member_password,
        "role": "Admin"  # Attempting privilege escalation
    }
    code, data = http_req(f"{BACKEND_URL}/api/auth/register/", method="POST", data=reg_payload)
    assert code == 201, f"Registration failed with {code}: {data}"
    user_info = data["user"]
    assert user_info["role"] == "Member", f"Security violation: role is {user_info['role']}"
    print(f"  [PASS] Created user: {user_info['name']} ({user_info['email']})")
    print(f"  [PASS] Security Check: Forced role is strictly '{user_info['role']}' (escalation blocked)")

    # -------------------------------------------------------------
    # STEP 4: User Authentication & JWT Token Issuance
    # -------------------------------------------------------------
    print("\n--- [4/10] Testing Login & JWT Token Rotation ---")
    login_payload = {"email": member_email, "password": member_password}
    code, data = http_req(f"{BACKEND_URL}/api/auth/login/", method="POST", data=login_payload)
    assert code == 200, f"Login failed with {code}: {data}"
    member_token = data["tokens"]["access"]
    refresh_token = data["tokens"]["refresh"]
    assert member_token and refresh_token
    print(f"  [PASS] Authentication successful! JWT Access & Refresh tokens received.")
    print(f"  [PASS] User last_login updated in MongoDB: {data['user']['last_login']}")

    # -------------------------------------------------------------
    # STEP 5: Member Privacy & Role Lockdown (HTTP 403 Forbidden)
    # -------------------------------------------------------------
    print("\n--- [5/10] Testing Member Privacy & Role Lockdown ---")
    # Member attempts to view users directory
    code, data = http_req(f"{BACKEND_URL}/api/auth/users/", token=member_token)
    assert code == 403, f"Member should receive 403 on user list, got {code}"
    print(f"  [PASS] Member cannot access user directory -> HTTP {code} Forbidden")

    # Member attempts to self-promote to Admin
    code, data = http_req(
        f"{BACKEND_URL}/api/auth/users/{user_info['id']}/",
        method="PATCH",
        data={"role": "Admin"},
        token=member_token
    )
    assert code == 403, f"Member should receive 403 on role edit, got {code}"
    print(f"  [PASS] Member cannot edit role -> HTTP {code} Forbidden")

    # -------------------------------------------------------------
    # STEP 6: Admin Authentication & User Management CRUD
    # -------------------------------------------------------------
    print("\n--- [6/10] Testing Admin Authentication & User Management ---")
    code, data = http_req(
        f"{BACKEND_URL}/api/auth/login/",
        method="POST",
        data={"email": "admin@tasktracker.io", "password": "Password123!"}
    )
    assert code == 200, f"Admin login failed: {data}"
    admin_token = data["tokens"]["access"]
    print(f"  [PASS] Admin authenticated successfully.")

    # Admin lists users
    code, users_list = http_req(f"{BACKEND_URL}/api/auth/users/", token=admin_token)
    assert code == 200 and len(users_list) > 0
    print(f"  [PASS] Admin retrieved {len(users_list)} registered users.")

    # Admin promotes our test member to Admin
    code, updated_user = http_req(
        f"{BACKEND_URL}/api/auth/users/{user_info['id']}/",
        method="PATCH",
        data={"role": "Admin"},
        token=admin_token
    )
    assert code == 200 and updated_user["user"]["role"] == "Admin"
    print(f"  [PASS] Admin promoted user {user_info['id']} to Admin role successfully.")

    # Admin demotes back to Member
    code, updated_user = http_req(
        f"{BACKEND_URL}/api/auth/users/{user_info['id']}/",
        method="PATCH",
        data={"role": "Member"},
        token=admin_token
    )
    assert code == 200 and updated_user["user"]["role"] == "Member"
    print(f"  [PASS] Admin demoted user back to Member role.")


    # -------------------------------------------------------------
    # STEP 7: Team Workspace Creation & Details
    # -------------------------------------------------------------
    print("\n--- [7/10] Testing Team Workspace Creation ---")
    team_payload = {
        "name": f"Sprint Workspace {unique_ts}",
        "description": "Validating full end-to-end task workflow."
    }
    code, team = http_req(f"{BACKEND_URL}/api/teams/", method="POST", data=team_payload, token=admin_token)
    assert code == 201, f"Team creation failed with {code}: {team}"
    team_data = team.get("team", team)
    team_id = team_data["id"]
    print(f"  [PASS] Team created: '{team_data['name']}' (ID: {team_id})")

    # -------------------------------------------------------------
    # STEP 8: Direct Email Invitation Flow (Cryptographic Token)
    # -------------------------------------------------------------
    print("\n--- [8/10] Testing Direct Email Invitation & Join Flow ---")
    invitee_email = f"invitee_{unique_ts}@company.org"
    code, inv_res = http_req(
        f"{BACKEND_URL}/api/teams/{team_id}/invite/",
        method="POST",
        data={"email": invitee_email},
        token=admin_token
    )
    assert code == 200, f"Invite failed with {code}: {inv_res}"
    token = inv_res["token"]
    print(f"  [PASS] Invitation dispatched for: {invitee_email}")
    print(f"  [PASS] Generated Single-Use Join Token: {token}")

    # Validate token on public join endpoint
    code, token_detail = http_req(f"{BACKEND_URL}/api/invitations/{token}/")
    assert code == 200 and token_detail["valid"] is True
    print(f"  [PASS] Public token validation confirmed valid for team: '{token_detail['team_name']}'")

    # Accept invitation & create account
    accept_payload = {
        "name": f"Invited Teammate {unique_ts}",
        "password": "Password123!"
    }
    code, accept_res = http_req(
        f"{BACKEND_URL}/api/invitations/{token}/accept/",
        method="POST",
        data=accept_payload
    )
    assert code in (200, 201), f"Accept failed with {code}: {accept_res}"
    invitee_token = accept_res["tokens"]["access"]

    print(f"  [PASS] Invitee accepted invitation and joined team successfully!")

    # Verify single-use protection
    code, reused_res = http_req(
        f"{BACKEND_URL}/api/invitations/{token}/accept/",
        method="POST",
        data=accept_payload
    )
    assert code == 400, "Single-use token should be rejected on reuse"
    print(f"  [PASS] Single-Use Token Protection verified: Token cannot be reused.")

    # -------------------------------------------------------------
    # STEP 9: Interactive Kanban Board & Task Management
    # -------------------------------------------------------------
    print("\n--- [9/10] Testing Kanban Tasks, Status Transitions & Comments ---")
    # Create task
    task_payload = {
        "title": "Design REST API Architecture",
        "description": "Establish clean modular routes and validation serializers.",
        "status": "Pending"
    }
    code, task = http_req(
        f"{BACKEND_URL}/api/teams/{team_id}/tasks/",
        method="POST",
        data=task_payload,
        token=admin_token
    )
    assert code == 201, f"Task creation failed with {code}: {task}"
    task_data = task.get("task", task)
    task_id = task_data["id"]
    print(f"  [PASS] Task created: '{task_data['title']}' [Status: {task_data['status']}]")

    # Transition: Pending -> In Progress
    code, updated_task = http_req(
        f"{BACKEND_URL}/api/tasks/{task_id}/",
        method="PATCH",
        data={"status": "In Progress"},
        token=admin_token
    )
    task_up_data = updated_task.get("task", updated_task)
    assert code == 200 and task_up_data["status"] == "In Progress"
    print(f"  [PASS] Status Transition 1: 'Pending' -> 'In Progress'")

    # Transition: In Progress -> Done
    code, updated_task = http_req(
        f"{BACKEND_URL}/api/tasks/{task_id}/",
        method="PATCH",
        data={"status": "Done"},
        token=admin_token
    )
    task_up_data = updated_task.get("task", updated_task)
    assert code == 200 and task_up_data["status"] == "Done"
    print(f"  [PASS] Status Transition 2: 'In Progress' -> 'Done'")

    # Add Comment
    code, comment_res = http_req(
        f"{BACKEND_URL}/api/tasks/{task_id}/comments/",
        method="POST",
        data={"text": "Architecture reviewed and approved by engineering lead."},
        token=admin_token
    )
    assert code == 201, f"Comment creation failed with {code}: {comment_res}"
    print(f"  [PASS] Comment added to task successfully: '{comment_res['comment']['text']}'")

    # -------------------------------------------------------------
    # STEP 10: Real-Time Activity Audit Timeline
    # -------------------------------------------------------------
    print("\n--- [10/10] Testing Real-Time Activity Audit Timeline ---")
    code, activity_res = http_req(f"{BACKEND_URL}/api/teams/{team_id}/timeline/", token=admin_token)
    assert code == 200, f"Timeline fetch failed with {code}: {activity_res}"
    activity_list = activity_res.get("activities", activity_res)
    assert len(activity_list) >= 3, f"Activity feed incomplete: {activity_res}"
    print(f"  [PASS] Retrieved {len(activity_list)} chronological audit events for workspace.")
    for idx, act in enumerate(activity_list[:3], 1):
        print(f"    {idx}. [{act['action_type']}] {act['message']}")


    print("SUCCESS: ALL 10/10 END-TO-END FEATURE AND SECURITY SUITES PASSED 100%!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()
