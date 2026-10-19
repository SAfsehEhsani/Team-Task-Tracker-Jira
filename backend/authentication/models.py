import mongoengine
from datetime import datetime
from django.contrib.auth.hashers import make_password, check_password

class User(mongoengine.Document):
    meta = {
        'collection': 'users',
        'indexes': [
            'email',
            'role'
        ]
    }

    name = mongoengine.StringField(required=True, max_length=150)
    email = mongoengine.EmailField(required=True, unique=True)
    password = mongoengine.StringField(required=True)
    role = mongoengine.StringField(required=True, choices=['Admin', 'Member'], default='Member')
    created_at = mongoengine.DateTimeField(default=datetime.utcnow)
    last_login = mongoengine.DateTimeField(null=True)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __str__(self):
        return f"{self.name} ({self.email}) [{self.role}]"
