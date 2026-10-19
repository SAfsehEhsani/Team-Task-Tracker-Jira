from activity.models import Activity

def log_activity(team, user, action_type, message, task=None, metadata=None):
    """
    Helper function to record an activity timeline item.
    """
    try:
        activity = Activity(
            team=team,
            user=user,
            user_name=user.name,
            action_type=action_type,
            message=message,
            task=task,
            metadata=metadata or {}
        )
        activity.save()
        return activity
    except Exception as e:
        print(f"[Activity Log Error] Failed to log activity: {e}")
        return None
