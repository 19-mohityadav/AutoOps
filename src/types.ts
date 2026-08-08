export type IssueCategory = 
  | 'Road'
  | 'Electricity'
  | 'Water'
  | 'Garbage'
  | 'Public Safety'
  | 'Maintenance'
  | 'IT'
  | 'Other';

export type IssuePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type IssueStatus = 
  | 'NEW'
  | 'ANALYZING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'UNASSIGNED';

export type UserRole = 'CITIZEN' | 'EMPLOYEE' | 'ADMIN';

export type EmployeeAvailability = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_LEAVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id?: string;
}

export interface Department {
  id: string;
  name: string;
  category: IssueCategory;
  description: string;
}

export interface Employee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department_id: string;
  department_name: string;
  skills: string[];
  availability: EmployeeAvailability;
  active_task_count: number;
  max_capacity: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  contact_info?: string;
  image_url?: string;
  category: IssueCategory;
  subcategory: string;
  priority: IssuePriority;
  summary: string;
  status: IssueStatus;
  department_id?: string;
  department_name?: string;
  assigned_employee_id?: string;
  assigned_employee_name?: string;
  created_at: string;
  updated_at: string;
  confidence_score?: number;
  ai_used: boolean;
  classification_reason?: string;
  assignment_reason?: string;
}

export interface Task {
  id: string;
  issue_id: string;
  assigned_employee_id: string;
  assigned_employee_name: string;
  assigned_at: string;
  status: IssueStatus;
  resolution_note?: string;
  resolved_at?: string;
}

export interface DecisionLog {
  id: string;
  issue_id: string;
  timestamp: string;
  step_name: string;
  decision_type: string;
  decision: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface AIClassificationResult {
  category: IssueCategory;
  subcategory: string;
  priority: IssuePriority;
  department: string;
  required_skill: string;
  summary: string;
  reasoning: string;
  confidence: number;
  used_fallback: boolean;
}

export interface DashboardStats {
  total_issues: number;
  unassigned_issues: number;
  assigned_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  critical_high_issues: number;
  category_breakdown: Record<string, number>;
  department_workload: Array<{ department_name: string; active_tasks: number; employee_count: number }>;
  avg_resolution_time_hours?: number;
}
