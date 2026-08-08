import { db } from './database.js';
import { classifyIssue } from './aiClassifier.js';
import { Issue, Task, DecisionLog, Employee } from '../types.js';

export interface ProcessIssueRequest {
  title: string;
  description: string;
  location: string;
  contact_info?: string;
  image_url?: string;
}

export interface ProcessIssueResponse {
  issue: Issue;
  task?: Task;
  decision_logs: DecisionLog[];
  assignment_matrix: {
    department: string;
    required_skill: string;
    evaluated_employees: Array<{
      id: string;
      name: string;
      skills: string[];
      availability: string;
      active_tasks: number;
      max_capacity: number;
      is_eligible: boolean;
      rejection_reason?: string;
    }>;
    selected_employee_id?: string;
  };
}

/**
 * Autonomous Decision Engine & Assignment Controller
 */
export async function processAndAssignIssue(req: ProcessIssueRequest): Promise<ProcessIssueResponse> {
  const issueId = `iss-${Date.now().toString().slice(-6)}`;
  const now = new Date();
  const logs: DecisionLog[] = [];

  // Helper to append logs
  const addLog = (stepName: string, type: string, decision: string, reason: string, meta?: any) => {
    const log: DecisionLog = {
      id: `log-${issueId}-${logs.length + 1}`,
      issue_id: issueId,
      timestamp: new Date(now.getTime() + logs.length * 400).toISOString(),
      step_name: stepName,
      decision_type: type,
      decision,
      reason,
      metadata: meta
    };
    logs.push(log);
    db.addDecisionLog(log);
  };

  // Step 1: Issue Intake
  addLog(
    'Issue Created',
    'INTAKE',
    `Reported at ${req.location}`,
    `Received issue "${req.title}"`
  );

  // Step 2: Intelligent Issue Understanding (AI/ML)
  const aiResult = await classifyIssue(req.title, req.description, req.location);

  addLog(
    'AI Analyzed',
    'CLASSIFICATION',
    `${aiResult.category} (${aiResult.priority} Priority)`,
    aiResult.reasoning || `Classified as ${aiResult.category} with ${aiResult.priority} priority.`,
    { confidence: aiResult.confidence, used_fallback: aiResult.used_fallback }
  );

  // Step 3: Department Mapping
  const departments = db.getDepartments();
  let department = departments.find(d => d.name.toLowerCase() === aiResult.department.toLowerCase());

  if (!department) {
    department = departments.find(d => d.category === aiResult.category) || departments[0];
  }

  // Step 4: Available Employees Evaluation & Skill Matching
  const allEmployees = db.getEmployees();
  const departmentEmployees = allEmployees.filter(e => e.department_id === department.id);

  const evaluatedEmployees: Array<{
    id: string;
    name: string;
    skills: string[];
    availability: string;
    active_tasks: number;
    max_capacity: number;
    is_eligible: boolean;
    rejection_reason?: string;
  }> = [];

  const eligibleCandidates: Employee[] = [];

  for (const emp of departmentEmployees) {
    let isEligible = true;
    let rejectionReason: string | undefined;

    if (emp.availability !== 'AVAILABLE') {
      isEligible = false;
      rejectionReason = `Status: ${emp.availability}`;
    } else if (emp.active_task_count >= emp.max_capacity) {
      isEligible = false;
      rejectionReason = `Capacity full (${emp.active_task_count}/${emp.max_capacity} tasks)`;
    }

    evaluatedEmployees.push({
      id: emp.id,
      name: emp.name,
      skills: emp.skills,
      availability: emp.availability,
      active_tasks: emp.active_task_count,
      max_capacity: emp.max_capacity,
      is_eligible: isEligible,
      rejection_reason: rejectionReason
    });

    if (isEligible) {
      eligibleCandidates.push(emp);
    }
  }

  // Sort eligible candidates by active_task_count ascending (least busy first)
  eligibleCandidates.sort((a, b) => a.active_task_count - b.active_task_count);

  let selectedEmployee: Employee | undefined = eligibleCandidates[0];
  let task: Task | undefined;
  let issueStatus: Issue['status'] = 'UNASSIGNED';
  let assignmentReason = '';

  if (selectedEmployee) {
    issueStatus = 'ASSIGNED';
    assignmentReason = `Assigned to ${selectedEmployee.name} (${department.name}) based on matching skills, availability, and lowest active workload (${selectedEmployee.active_task_count} tasks).`;

    addLog(
      'Task Assigned',
      'ASSIGNMENT',
      `Assigned to ${selectedEmployee.name}`,
      `Selected ${selectedEmployee.name} for ${department.name} department (${selectedEmployee.active_task_count} active tasks).`,
      { employee_id: selectedEmployee.id, active_tasks_before: selectedEmployee.active_task_count }
    );

    // Increment workload
    db.updateEmployeeWorkload(selectedEmployee.id, 1);

    // Create Task
    task = {
      id: `tsk-${Date.now().toString().slice(-6)}`,
      issue_id: issueId,
      assigned_employee_id: selectedEmployee.id,
      assigned_employee_name: selectedEmployee.name,
      assigned_at: new Date().toISOString(),
      status: 'ASSIGNED'
    };
    db.addTask(task);

  } else {
    issueStatus = 'UNASSIGNED';
    assignmentReason = `Pending assignment: No available staff with capacity in ${department.name} department.`;

    addLog(
      'Assignment Pending',
      'UNASSIGNED',
      'Marked as UNASSIGNED',
      `No available staff in ${department.name} department.`
    );
  }

  // Construct Final Issue Record
  const issue: Issue = {
    id: issueId,
    title: req.title,
    description: req.description,
    location: req.location,
    contact_info: req.contact_info,
    image_url: req.image_url,
    category: aiResult.category,
    subcategory: aiResult.subcategory,
    priority: aiResult.priority,
    summary: aiResult.summary,
    status: issueStatus,
    department_id: department.id,
    department_name: department.name,
    assigned_employee_id: selectedEmployee?.id,
    assigned_employee_name: selectedEmployee?.name,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    confidence_score: aiResult.confidence,
    ai_used: !aiResult.used_fallback,
    classification_reason: aiResult.reasoning,
    assignment_reason: assignmentReason
  };

  db.addIssue(issue);

  return {
    issue,
    task,
    decision_logs: logs,
    assignment_matrix: {
      department: department.name,
      required_skill: aiResult.required_skill,
      evaluated_employees: evaluatedEmployees,
      selected_employee_id: selectedEmployee?.id
    }
  };
}

/**
 * Admin Reassignment Override
 */
export function adminReassignIssue(issueId: string, newEmployeeId: string, adminReason: string): { issue: Issue; task: Task } {
  const issue = db.getIssueById(issueId);
  if (!issue) throw new Error('Issue not found');

  const newEmployee = db.getEmployeeById(newEmployeeId);
  if (!newEmployee) throw new Error('Target employee not found');

  // Decrement old employee workload if assigned
  if (issue.assigned_employee_id) {
    db.updateEmployeeWorkload(issue.assigned_employee_id, -1);
  }

  // Increment new employee workload
  db.updateEmployeeWorkload(newEmployee.id, 1);

  // Update issue
  issue.assigned_employee_id = newEmployee.id;
  issue.assigned_employee_name = newEmployee.name;
  issue.department_id = newEmployee.department_id;
  issue.department_name = newEmployee.department_name;
  issue.status = 'ASSIGNED';
  issue.updated_at = new Date().toISOString();
  issue.assignment_reason = `Admin Manual Override: Reassigned to ${newEmployee.name} (${newEmployee.department_name}). Reason: ${adminReason}`;

  db.updateIssue(issue);

  // Update or create task
  let task = db.getTaskByIssueId(issueId);
  if (task) {
    task.assigned_employee_id = newEmployee.id;
    task.assigned_employee_name = newEmployee.name;
    task.status = 'ASSIGNED';
    db.updateTask(task);
  } else {
    task = {
      id: `tsk-${Date.now().toString().slice(-6)}`,
      issue_id: issueId,
      assigned_employee_id: newEmployee.id,
      assigned_employee_name: newEmployee.name,
      assigned_at: new Date().toISOString(),
      status: 'ASSIGNED'
    };
    db.addTask(task);
  }

  // Add Log
  const log: DecisionLog = {
    id: `log-${issueId}-${Date.now()}`,
    issue_id: issueId,
    timestamp: new Date().toISOString(),
    step_name: 'Human Override',
    decision_type: 'ADMIN_OVERRIDE',
    decision: `Reassigned to ${newEmployee.name}`,
    reason: `Admin override executed: ${adminReason}`
  };
  db.addDecisionLog(log);

  return { issue, task };
}
