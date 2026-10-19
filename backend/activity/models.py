import mongoengine
from datetime import datetime

class Activity(mongoengine.Document):
    meta = {
        'collection': 'activities',
        'indexes': [
            'team',
            '-created_at',
            ('team', '-created_at')
        ],
        'ordering': ['-created_at']
    }

    team = mongoengine.ReferenceField('Team', required=True, reverse_delete_rule=mongoengine.CASCADE)
    task = mongoengine.ReferenceField('Task', null=True, reverse_delete_rule=mongoengine.NULLIFY)
    user = mongoengine.ReferenceField('User', required=True, reverse_delete_rule=mongoengine.CASCADE)
    user_name = mongoengine.StringField(required=True)
    action_type = mongoengine.StringField(required=True)
    message = mongoengine.StringField(required=True)
    metadata = mongoengine.DictField(default=dict)
    created_at = mongoengine.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'team_id': str(self.team.id) if self.team else None,
            'task_id': str(self.task.id) if self.task else None,
            'user_id': str(self.user.id) if self.user else None,
            'user_name': self.user_name,
            'action_type': self.action_type,
            'message': self.message,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __str__(self):
        return f"[{self.action_type}] {self.message}"
