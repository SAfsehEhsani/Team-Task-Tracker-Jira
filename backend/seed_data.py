import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import User
from teams.models import Team
from tasks.models import Task, TaskComment
from activity.models import Activity
from activity.utils import log_activity
from datetime import datetime, timedelta

def run_seed():
    print("Clearing old sample data...")
    Activity.drop_collection()
    Task.drop_collection()
    Team.drop_collection()
    User.drop_collection()

    print("Creating users...")
    admin = User(name="Saumyakanta", email="admin@tasktracker.io", role="Admin")
    admin.set_password("Password123!")
    admin.save()

    alice = User(name="Alice Chen", email="alice@tasktracker.io", role="Member")
    alice.set_password("Password123!")
    alice.save()

    david = User(name="David Miller", email="david@tasktracker.io", role="Member")
    david.set_password("Password123!")
    david.save()

    sophia = User(name="Sophia Patel", email="sophia@tasktracker.io", role="Member")
    sophia.set_password("Password123!")
    sophia.save()

    print("Creating teams...")
    # Team 1: Engineering Core
    eng_team = Team(
        name="Engineering Core",
        description="Core infrastructure, backend microservices, and high-performance frontend interfaces.",
        created_by=admin,
        members=[admin, alice, david, sophia],
        created_at=datetime.utcnow() - timedelta(days=5)
    )
    eng_team.save()

    # Team 2: Product & Design
    product_team = Team(
        name="Product & Design",
        description="UX research, component libraries, design systems, and product roadmaps.",
        created_by=admin,
        members=[admin, sophia, alice],
        created_at=datetime.utcnow() - timedelta(days=3)
    )
    product_team.save()

    print("Creating tasks & activities for Engineering Core...")
    # Activity: Team created
    log_activity(eng_team, admin, 'team_created', f'{admin.name} created team "{eng_team.name}".')

    # Task 1
    t1 = Task(
        title="Design API endpoints",
        description="Specify RESTful routes for auth, teams, tasks, and real-time activity timeline using DRF.",
        status="In Progress",
        team=eng_team,
        created_by=admin,
        assigned_to=alice,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    t1.comments.append(TaskComment(
        user=alice,
        user_name=alice.name,
        text="Finished initial draft of the OpenAPI specs. Reviewing token expiration strategies.",
        created_at=datetime.utcnow() - timedelta(hours=14)
    ))
    t1.comments.append(TaskComment(
        user=admin,
        user_name=admin.name,
        text="Make sure to include JWT refresh token rotation.",
        created_at=datetime.utcnow() - timedelta(hours=10)
    ))
    t1.save()

    log_activity(eng_team, admin, 'task_created', f'{admin.name} created task "{t1.title}" and assigned it to {alice.name}.', task=t1)
    log_activity(eng_team, admin, 'status_changed', f'{admin.name} changed status of "{t1.title}" to In Progress.', task=t1)
    log_activity(eng_team, alice, 'comment_added', f'{alice.name} commented on "{t1.title}": "Finished initial draft..."', task=t1)

    # Task 2
    t2 = Task(
        title="Setup MongoDB schema & MongoEngine",
        description="Configure NoSQL collections, connection pooling, and MongoEngine document mapping.",
        status="Done",
        team=eng_team,
        created_by=admin,
        assigned_to=admin,
        created_at=datetime.utcnow() - timedelta(days=3)
    )
    t2.comments.append(TaskComment(
        user=admin,
        user_name=admin.name,
        text="Connected to local MongoDB cluster with full indexing.",
        created_at=datetime.utcnow() - timedelta(days=1)
    ))
    t2.save()
    log_activity(eng_team, admin, 'task_created', f'{admin.name} created task "{t2.title}".', task=t2)
    log_activity(eng_team, admin, 'status_changed', f'{admin.name} changed status of "{t2.title}" to Done.', task=t2)

    # Task 3
    t3 = Task(
        title="Implement JWT refresh tokens & frontend interceptors",
        description="Handle automatic silent token refresh when access tokens expire on Next.js client.",
        status="In Progress",
        team=eng_team,
        created_by=admin,
        assigned_to=david,
        created_at=datetime.utcnow() - timedelta(hours=18)
    )
    t3.save()
    log_activity(eng_team, admin, 'task_created', f'{admin.name} created task "{t3.title}" and assigned it to {david.name}.', task=t3)

    # Task 4
    t4 = Task(
        title="Build Next.js interactive Kanban board",
        description="Implement drag/drop or column-based status changing with live timeline updates.",
        status="Pending",
        team=eng_team,
        created_by=admin,
        assigned_to=sophia,
        created_at=datetime.utcnow() - timedelta(hours=6)
    )
    t4.save()
    log_activity(eng_team, admin, 'task_created', f'{admin.name} created task "{t4.title}" and assigned it to {sophia.name}.', task=t4)

    # Task 5 (Unassigned)
    t5 = Task(
        title="Dockerize backend & frontend stack",
        description="Setup multi-stage Dockerfiles and docker-compose orchestration.",
        status="Pending",
        team=eng_team,
        created_by=admin,
        assigned_to=None,
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    t5.save()
    log_activity(eng_team, admin, 'task_created', f'{admin.name} created task "{t5.title}".', task=t5)

    print("Creating tasks for Product & Design...")
    log_activity(product_team, admin, 'team_created', f'{admin.name} created team "{product_team.name}".')
    pt1 = Task(
        title="User feedback on dark mode UI",
        description="Gather feedback on slate/zinc palette contrast and typography readability.",
        status="Done",
        team=product_team,
        created_by=admin,
        assigned_to=sophia,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    pt1.save()
    log_activity(product_team, admin, 'task_created', f'{admin.name} created task "{pt1.title}".', task=pt1)
    log_activity(product_team, sophia, 'status_changed', f'{sophia.name} changed status of "{pt1.title}" to Done.', task=pt1)

    print("\nDatabase seeded successfully!")
    print("Demo Users:")
    print("  1. Admin:  admin@tasktracker.io  / Password123! (Role: Admin)")
    print("  2. Member: alice@tasktracker.io  / Password123! (Role: Member)")
    print("  3. Member: david@tasktracker.io  / Password123! (Role: Member)")
    print("  4. Member: sophia@tasktracker.io / Password123! (Role: Member)")

if __name__ == '__main__':
    run_seed()
