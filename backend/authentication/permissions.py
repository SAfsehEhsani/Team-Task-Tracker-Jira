from rest_framework.permissions import BasePermission

class IsAuthenticatedCustom(BasePermission):
    """
    Allows access only to authenticated users.
    """
    message = "Authentication credentials were not provided or are invalid."

    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'id', None))

class IsAdminUserRole(BasePermission):
    """
    Allows access only to users with 'Admin' role.
    """
    message = "Only Admins can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            getattr(request.user, 'id', None) and
            getattr(request.user, 'role', '') == 'Admin'
        )
