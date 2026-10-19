from rest_framework import serializers
from authentication.models import User
from authentication.utils import generate_tokens, decode_token
from bson import ObjectId

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    role = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects(email=normalized).first():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def create(self, validated_data):
        # Public self-registration ALWAYS creates Member role.
        # Only existing Admins can promote users or assign Admin roles.
        user = User(
            name=validated_data['name'].strip(),
            email=validated_data['email'],
            role='Member'
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')

        user = User.objects(email=email).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        attrs['user'] = user
        return attrs

class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        refresh_token = attrs.get('refresh')
        try:
            payload = decode_token(refresh_token)
        except Exception as e:
            raise serializers.ValidationError(str(e))

        if payload.get('token_type') != 'refresh':
            raise serializers.ValidationError("Invalid token type. Refresh token required.")

        user_id = payload.get('user_id')
        try:
            user = User.objects.get(id=ObjectId(user_id))
        except (User.DoesNotExist, Exception):
            raise serializers.ValidationError("User associated with token no longer exists.")

        attrs['user'] = user
        return attrs
