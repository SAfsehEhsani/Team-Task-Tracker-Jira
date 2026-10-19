import mongoengine
from datetime import datetime
import uuid
from authentication.models import User
from teams.models import Team

class TaskComment(mongoengine.EmbeddedDocument):
    id = mongoengine.StringField(default=lambda: str(uuid.uuid4()))
    user = mongoengine.ReferenceField(User, required=True)
    user_name = mongoengine.StringField(required=True)
    text = mongoengine.StringField(required=True)
    created_at = mongoengine.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': str(self.user.id) if self.user else None,
            'user_name': self.user_name,
            'user_email': self.user.email if self.user else None,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Task(mongoengine.Document):
    meta = {
        'collection': 'tasks',
        'indexes': [
            'team',
            'status',
            'assigned_to',
            ('team', 'status'),
            '-created_at'
        ],
        'ordering': ['-created_at']
    }

    STATUS_CHOICES = ['Pending', 'In Progress', 'Done']

    title = mongoengine.StringField(required=True, max_length=250)
    description = mongoengine.StringField(default="")
    assigned_to = mongoengine.ReferenceField(User, null=True, reverse_delete_rule=mongoengine.NULLIFY)
    status = mongoengine.StringField(choices=STATUS_CHOICES, default='Pending')
    team = mongoengine.ReferenceField(Team, required=True, reverse_delete_rule=mongoengine.CASCADE)
    created_by = mongoengine.ReferenceField(User, required=True)
    comments = mongoengine.EmbeddedDocumentListField(TaskComment)
    created_at = mongoengine.DateTimeField(default=datetime.utcnow)
    updated_at = mongoengine.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'team_id': str(self.team.id) if self.team else None,
            'assigned_to': self.assigned_to.to_dict() if self.assigned_to else None,
            'created_by': self.created_by.to_dict() if self.created_by else None,
            'comments': [c.to_dict() for c in self.comments],
            'comment_count': len(self.comments),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __str__(self):
        return f"{self.title} [{self.status}]"
