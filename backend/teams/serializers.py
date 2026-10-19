from rest_framework import serializers
from teams.models import Team
from authentication.models import User

class TeamSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=150)
    description = serializers.CharField(allow_blank=True, default="")
    created_by = serializers.DictField(read_only=True)
    members = serializers.ListField(child=serializers.DictField(), read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

class TeamCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True)
    description = serializers.CharField(allow_blank=True, required=False, default="")

    def create(self, validated_data):
        user = self.context['request'].user
        team = Team(
            name=validated_data['name'].strip(),
            description=validated_data.get('description', '').strip(),
            created_by=user,
            members=[user] # Creator is automatically a member
        )
        team.save()
        return team

class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.strip().lower()
