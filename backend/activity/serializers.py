from rest_framework import serializers

class ActivitySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    team_id = serializers.CharField(read_only=True)
    task_id = serializers.CharField(read_only=True, allow_null=True)
    user_id = serializers.CharField(read_only=True)
    user_name = serializers.CharField(read_only=True)
    action_type = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)
    metadata = serializers.DictField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
