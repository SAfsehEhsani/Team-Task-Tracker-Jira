import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from authentication.models import User
from bson import ObjectId

ACCESS_TOKEN_LIFETIME = timedelta(minutes=60)
REFRESH_TOKEN_LIFETIME = timedelta(days=7)

def generate_tokens(user):
    now = datetime.utcnow()
    
    access_payload = {
        'user_id': str(user.id),
        'email': user.email,
        'role': user.role,
        'token_type': 'access',
        'iat': now,
        'exp': now + ACCESS_TOKEN_LIFETIME
    }
    
    refresh_payload = {
        'user_id': str(user.id),
        'token_type': 'refresh',
        'iat': now,
        'exp': now + REFRESH_TOKEN_LIFETIME
    }
    
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    
    return {
        'access': access_token,
        'refresh': refresh_token,
        'access_expires_in': int(ACCESS_TOKEN_LIFETIME.total_seconds()),
    }

def decode_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token has expired.')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid token.')

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
            
        token = parts[1]
        payload = decode_token(token)
        
        if payload.get('token_type') != 'access':
            raise AuthenticationFailed('Invalid token type for authorization.')
            
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('User ID not present in token payload.')
            
        try:
            user = User.objects.get(id=ObjectId(user_id))
        except (User.DoesNotExist, Exception):
            raise AuthenticationFailed('User not found.')
            
        return (user, token)
