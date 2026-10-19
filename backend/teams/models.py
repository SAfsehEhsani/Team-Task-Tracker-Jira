import mongoengine
from datetime import datetime
from authentication.models import User

class Team(mongoengine.Document):
    meta = {
        'collection': 'teams',
        'indexes': [
            'name',
            'created_by',
            'members'
        ]
    }

    name = mongoengine.StringField(required=True, max_length=150)
    description = mongoengine.StringField(default="")
    created_by = mongoengine.ReferenceField(User, required=True, reverse_delete_rule=mongoengine.CASCADE)
    members = mongoengine.ListField(mongoengine.ReferenceField(User))
    created_at = mongoengine.DateTimeField(default=datetime.utcnow)

    def is_member(self, user):
        if not user:
            return False
        # Creator is always a member
        if self.created_by and self.created_by.id == user.id:
            return True
        return any(m.id == user.id for m in self.members if m)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'created_by': self.created_by.to_dict() if self.created_by else None,
            'members': [m.to_dict() for m in self.members if m],
            'member_count': len(self.members),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __str__(self):
        return f"{self.name} (Created by {self.created_by.name if self.created_by else 'Unknown'})"

class TeamInvitation(mongoengine.Document):
    meta = {
        'collection': 'team_invitations',
        'indexes': [
            'token',
            'email',
            'team',
            'status'
        ]
    }

    team = mongoengine.ReferenceField(Team, required=True, reverse_delete_rule=mongoengine.CASCADE)
    email = mongoengine.EmailField(required=True)
    token = mongoengine.StringField(required=True, unique=True)
    invited_by = mongoengine.ReferenceField(User, required=True)
    status = mongoengine.StringField(choices=['pending', 'accepted', 'expired'], default='pending')
    created_at = mongoengine.DateTimeField(default=datetime.utcnow)
    expires_at = mongoengine.DateTimeField()

    def to_dict(self):
        return {
            'id': str(self.id),
            'team_id': str(self.team.id) if self.team else None,
            'team_name': self.team.name if self.team else '',
            'team_description': self.team.description if self.team else '',
            'email': self.email,
            'token': self.token,
            'invited_by_name': self.invited_by.name if self.invited_by else 'Admin',
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
