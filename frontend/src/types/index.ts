export type Role = 'Admin' | 'Member';

export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  last_login?: string | null;
  teams_count?: number;
  created_at?: string;
}

export interface TaskComment {
  id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  text: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  team_id: string;
  assigned_to?: User | null;
  created_by: User;
  comments: TaskComment[];
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  created_by: User;
  members: User[];
  member_count: number;
  created_at: string;
}

export interface Activity {
  id: string;
  team_id: string;
  task_id?: string | null;
  user_id: string;
  user_name: string;
  action_type: 'task_created' | 'status_changed' | 'comment_added' | 'task_assigned' | 'member_invited' | 'member_removed' | 'team_created' | 'task_updated' | 'task_deleted';
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  access_expires_in: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}
