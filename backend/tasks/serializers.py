from rest_framework import serializers
from tasks.models import Task, TaskComment
from authentication.models import User
from bson import ObjectId

class TaskCommentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    user_name = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(read_only=True)
    text = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

class TaskSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=250)
    description = serializers.CharField(allow_blank=True, default="")
    status = serializers.ChoiceField(choices=Task.STATUS_CHOICES)
    team_id = serializers.CharField(read_only=True)
    assigned_to = serializers.DictField(read_only=True, allow_null=True)
    created_by = serializers.DictField(read_only=True)
    comments = serializers.ListField(child=serializers.DictField(), read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class TaskCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=250, required=True)
    description = serializers.CharField(allow_blank=True, required=False, default="")
    status = serializers.ChoiceField(choices=Task.STATUS_CHOICES, default='Pending')
    assigned_to = serializers.CharField(required=False, allow_null=True, default=None)

    def validate_assigned_to(self, value):
        if not value:
            return None
        try:
            user = User.objects.get(id=ObjectId(value))
            return user
        except (User.DoesNotExist, Exception):
            raise serializers.ValidationError("Assigned user does not exist.")

class TaskUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=250, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    status = serializers.ChoiceField(choices=Task.STATUS_CHOICES, required=False)
    assigned_to = serializers.CharField(required=False, allow_null=True)

    def validate_assigned_to(self, value):
        if value is None or value == "":
            return None
        try:
            user = User.objects.get(id=ObjectId(value))
            return user
        except (User.DoesNotExist, Exception):
            raise serializers.ValidationError("Assigned user does not exist.")

class CommentCreateSerializer(serializers.Serializer):
    text = serializers.CharField(required=True, min_length=1)
