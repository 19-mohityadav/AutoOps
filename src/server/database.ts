import fs from 'fs';
import path from 'path';
import { Department, Employee, Issue, Task, DecisionLog, User } from '../types.js';

class PersistentDatabase {
  private departments: Department[] = [];
  private employees: Employee[] = [];
  private issues: Issue[] = [];
  private tasks: Task[] = [];
  private decisionLogs: DecisionLog[] = [];
  private users: User[] = [];

  private dataDir = path.join(process.cwd(), 'data');
  private storeFile = path.join(process.cwd(), 'data', 'store.json');

  constructor() {
    this.init();
  }

  private init(): void {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create data directory:', err);
      }
    }

    if (fs.existsSync(this.storeFile)) {
      try {
        const raw = fs.readFileSync(this.storeFile, 'utf8');
        const data = JSON.parse(raw);
        this.departments = data.departments || [];
        this.employees = data.employees || [];
        this.issues = data.issues || [];
        this.tasks = data.tasks || [];
        this.decisionLogs = data.decisionLogs || [];
        this.users = data.users || [];
        if (this.departments.length === 0 || this.employees.length === 0) {
          this.seed();
        }
        return;
      } catch (err) {
        console.warn('Error reading store file, re-seeding:', err);
      }
    }

    this.seed();
  }

  private persist(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const tempFile = path.join(this.dataDir, 'store.json.tmp');
      const data = {
        departments: this.departments,
        employees: this.employees,
        issues: this.issues,
        tasks: this.tasks,
        decisionLogs: this.decisionLogs,
        users: this.users,
        updated_at: new Date().toISOString()
      };
      
      // 1. Write state to temporary file synchronously
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');

      // 2. Atomically rename temp file to store.json
      try {
        fs.renameSync(tempFile, this.storeFile);
      } catch (renameErr) {
        // Fallback for rare cross-device link edge cases
        fs.copyFileSync(tempFile, this.storeFile);
        fs.unlinkSync(tempFile);
      }
    } catch (err) {
      console.warn('Failed to persist database to disk:', err);
    }
  }

  public seed(): void {
    this.departments = [
      { id: 'dept-road', name: 'Road Maintenance', category: 'Road', description: 'Handles road repairs, potholes, sidewalks, and traffic hazards' },
      { id: 'dept-elec', name: 'Electrical', category: 'Electricity', description: 'Handles street lights, power line issues, and public electrical hazards' },
      { id: 'dept-water', name: 'Water Department', category: 'Water', description: 'Handles water main leaks, drainage issues, and pipe repairs' },
      { id: 'dept-sanitation', name: 'Sanitation', category: 'Garbage', description: 'Handles municipal waste collection, garbage overflow, and public cleanliness' },
      { id: 'dept-safety', name: 'Public Safety', category: 'Public Safety', description: 'Handles urgent public hazards, traffic obstruction, and safety threats' },
      { id: 'dept-maint', name: 'Building Maintenance', category: 'Maintenance', description: 'Handles public building equipment, HVAC, elevators, and physical infrastructure' },
      { id: 'dept-it', name: 'IT Support', category: 'IT', description: 'Handles public kiosk systems, civic network connectivity, and municipal IT services' },
    ];

    this.users = [
      { id: 'usr-admin', name: 'Admin Operator', email: 'admin@civicops.gov', role: 'ADMIN' },
      { id: 'usr-aman', name: 'Aman Verma', email: 'aman.v@civicops.gov', role: 'EMPLOYEE', department_id: 'dept-road' },
      { id: 'usr-rahul', name: 'Rahul Kumar', email: 'rahul.k@civicops.gov', role: 'EMPLOYEE', department_id: 'dept-road' },
      { id: 'usr-priya', name: 'Priya Patel', email: 'priya.p@civicops.gov', role: 'EMPLOYEE', department_id: 'dept-elec' },
      { id: 'usr-deepak', name: 'Deepak Gupta', email: 'deepak.g@civicops.gov', role: 'EMPLOYEE', department_id: 'dept-sanitation' },
      { id: 'usr-citizen', name: 'John Citizen', email: 'john@example.com', role: 'CITIZEN' },
    ];

    this.employees = [
      // Road Maintenance Department
      {
        id: 'emp-rahul',
        user_id: 'usr-rahul',
        name: 'Rahul Kumar',
        email: 'rahul.k@civicops.gov',
        department_id: 'dept-road',
        department_name: 'Road Maintenance',
        skills: ['Road Repair', 'Asphalt Work', 'Pothole Filling'],
        availability: 'AVAILABLE',
        active_task_count: 4, // Higher workload
        max_capacity: 5
      },
      {
        id: 'emp-aman',
        user_id: 'usr-aman',
        name: 'Aman Verma',
        email: 'aman.v@civicops.gov',
        department_id: 'dept-road',
        department_name: 'Road Maintenance',
        skills: ['Road Repair', 'Pothole Filling', 'Traffic Safety'],
        availability: 'AVAILABLE',
        active_task_count: 1, // Lower workload - Preferred candidate!
        max_capacity: 5
      },
      {
        id: 'emp-vikas',
        user_id: 'usr-vikas',
        name: 'Vikas Sharma',
        email: 'vikas.s@civicops.gov',
        department_id: 'dept-road',
        department_name: 'Road Maintenance',
        skills: ['Road Repair', 'Heavy Equipment'],
        availability: 'UNAVAILABLE', // Unavailable
        active_task_count: 0,
        max_capacity: 5
      },

      // Electrical Department
      {
        id: 'emp-priya',
        user_id: 'usr-priya',
        name: 'Priya Patel',
        email: 'priya.p@civicops.gov',
        department_id: 'dept-elec',
        department_name: 'Electrical',
        skills: ['Electrical Repair', 'Street Light Maintenance', 'Transformer Ops'],
        availability: 'AVAILABLE',
        active_task_count: 2,
        max_capacity: 5
      },
      {
        id: 'emp-suresh',
        user_id: 'usr-suresh',
        name: 'Suresh Nair',
        email: 'suresh.n@civicops.gov',
        department_id: 'dept-elec',
        department_name: 'Electrical',
        skills: ['Electrical Repair', 'High Voltage', 'Street Light Maintenance'],
        availability: 'AVAILABLE',
        active_task_count: 5, // At max capacity
        max_capacity: 5
      },

      // Water Department
      {
        id: 'emp-anita',
        user_id: 'usr-anita',
        name: 'Anita Rao',
        email: 'anita.r@civicops.gov',
        department_id: 'dept-water',
        department_name: 'Water Department',
        skills: ['Plumbing', 'Pipe Leak Repair', 'Drainage Unblocking'],
        availability: 'AVAILABLE',
        active_task_count: 1,
        max_capacity: 5
      },

      // Sanitation Department
      {
        id: 'emp-deepak',
        user_id: 'usr-deepak',
        name: 'Deepak Gupta',
        email: 'deepak.g@civicops.gov',
        department_id: 'dept-sanitation',
        department_name: 'Sanitation',
        skills: ['Waste Management', 'Garbage Collection', 'Biohazard Cleaning'],
        availability: 'AVAILABLE',
        active_task_count: 0,
        max_capacity: 5
      },

      // Public Safety (All busy or unavailable to demonstrate Scenario 4!)
      {
        id: 'emp-vikram',
        user_id: 'usr-vikram',
        name: 'Vikram Singh',
        email: 'vikram.s@civicops.gov',
        department_id: 'dept-safety',
        department_name: 'Public Safety',
        skills: ['Public Safety Ops', 'Hazard Control'],
        availability: 'UNAVAILABLE',
        active_task_count: 5,
        max_capacity: 5
      },

      // IT Support
      {
        id: 'emp-maya',
        user_id: 'usr-maya',
        name: 'Maya Lin',
        email: 'maya.l@civicops.gov',
        department_id: 'dept-it',
        department_name: 'IT Support',
        skills: ['Network/IT', 'Hardware Support', 'Software Troubleshooting'],
        availability: 'AVAILABLE',
        active_task_count: 1,
        max_capacity: 5
      }
    ];

    // Seed initial demo issues & tasks
    this.issues = [
      {
        id: 'iss-101',
        title: 'Broken water pipe leaking heavily on Park Street',
        description: 'Clean water is leaking onto the main walkway near Park Street metro exit for the past 5 hours.',
        location: 'Park Street Metro Exit Gate 2',
        contact_info: 'resident@parkstreet.org',
        category: 'Water',
        subcategory: 'Pipe Leakage',
        priority: 'High',
        summary: 'Water pipe leak creating puddle hazards near metro exit.',
        status: 'IN_PROGRESS',
        department_id: 'dept-water',
        department_name: 'Water Department',
        assigned_employee_id: 'emp-anita',
        assigned_employee_name: 'Anita Rao',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        confidence_score: 0.96,
        ai_used: true,
        classification_reason: 'Automated AI classified issue as Water / Pipe Leakage with High priority due to pedestrian hazard and continuous flow.',
        assignment_reason: 'Assigned to Anita Rao because she belongs to Water Department, possesses Pipe Leak Repair skill, is AVAILABLE, and has lowest workload (1 task).'
      },
      {
        id: 'iss-102',
        title: 'Traffic light power line sparking',
        description: 'Overhead electrical wire sparking near central square traffic signal.',
        location: 'Central Square Junction',
        contact_info: 'police.traffic@civic.gov',
        category: 'Electricity',
        subcategory: 'Electrical Hazard',
        priority: 'Critical',
        summary: 'Sparking overhead wire creating immediate public safety risk.',
        status: 'ASSIGNED',
        department_id: 'dept-elec',
        department_name: 'Electrical',
        assigned_employee_id: 'emp-priya',
        assigned_employee_name: 'Priya Patel',
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        confidence_score: 0.98,
        ai_used: true,
        classification_reason: 'AI classified as Electricity / Electrical Hazard with Critical priority due to immediate public safety threat.',
        assignment_reason: 'Assigned to Priya Patel who has Electrical Repair skills and active task capacity (2/5) over Suresh Nair who is at max capacity (5/5).'
      }
    ];

    this.tasks = [
      {
        id: 'tsk-101',
        issue_id: 'iss-101',
        assigned_employee_id: 'emp-anita',
        assigned_employee_name: 'Anita Rao',
        assigned_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'IN_PROGRESS'
      },
      {
        id: 'tsk-102',
        issue_id: 'iss-102',
        assigned_employee_id: 'emp-priya',
        assigned_employee_name: 'Priya Patel',
        assigned_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: 'ASSIGNED'
      }
    ];

    this.decisionLogs = [
      {
        id: 'log-101-1',
        issue_id: 'iss-101',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        step_name: 'Issue Created',
        decision_type: 'INTAKE',
        decision: 'Received civic report',
        reason: 'Public user submitted issue via portal'
      },
      {
        id: 'log-101-2',
        issue_id: 'iss-101',
        timestamp: new Date(Date.now() - 3600000 * 4 + 500).toISOString(),
        step_name: 'AI Analysis',
        decision_type: 'CLASSIFICATION',
        decision: 'Category: Water, Priority: High',
        reason: 'Extracted keywords "water pipe", "leaking heavily" and detected pedestrian hazard signal'
      },
      {
        id: 'log-101-3',
        issue_id: 'iss-101',
        timestamp: new Date(Date.now() - 3600000 * 4 + 1200).toISOString(),
        step_name: 'Department Resolution',
        decision_type: 'ROUTING',
        decision: 'Department: Water Department',
        reason: 'Mapped Water category to Water Department'
      },
      {
        id: 'log-101-4',
        issue_id: 'iss-101',
        timestamp: new Date(Date.now() - 3600000 * 4 + 1800).toISOString(),
        step_name: 'Employee Selection',
        decision_type: 'ASSIGNMENT',
        decision: 'Selected Anita Rao',
        reason: 'Matched skill "Pipe Leak Repair", status AVAILABLE, lowest workload (1 task)'
      }
    ];

    this.persist();
  }

  // Getters
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === clean);
  }

  public addUser(user: User): void {
    const existingIdx = this.users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx !== -1) {
      this.users[existingIdx] = user;
    } else {
      this.users.push(user);
    }
    this.persist();
  }

  public getDepartments(): Department[] {
    return [...this.departments];
  }

  public getEmployees(): Employee[] {
    return [...this.employees];
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  public getIssues(): Issue[] {
    return [...this.issues].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getIssueById(id: string): Issue | undefined {
    return this.issues.find(i => i.id === id);
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }

  public getTaskByIssueId(issueId: string): Task | undefined {
    return this.tasks.find(t => t.issue_id === issueId);
  }

  public getDecisionLogs(): DecisionLog[] {
    return [...this.decisionLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getDecisionLogsByIssueId(issueId: string): DecisionLog[] {
    return this.decisionLogs
      .filter(l => l.issue_id === issueId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Setters / Updates
  public addIssue(issue: Issue): void {
    this.issues.unshift(issue);
    this.persist();
  }

  public updateIssue(issue: Issue): void {
    const idx = this.issues.findIndex(i => i.id === issue.id);
    if (idx !== -1) {
      this.issues[idx] = issue;
      this.persist();
    }
  }

  public addTask(task: Task): void {
    this.tasks.unshift(task);
    this.persist();
  }

  public updateTask(task: Task): void {
    const idx = this.tasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      this.tasks[idx] = task;
      this.persist();
    }
  }

  public addDecisionLog(log: DecisionLog): void {
    this.decisionLogs.push(log);
    this.persist();
  }

  public updateEmployeeWorkload(employeeId: string, delta: number): void {
    const emp = this.employees.find(e => e.id === employeeId);
    if (emp) {
      emp.active_task_count = Math.max(0, emp.active_task_count + delta);
      this.persist();
    }
  }

  public updateEmployeeAvailability(employeeId: string, availability: Employee['availability']): void {
    const emp = this.employees.find(e => e.id === employeeId);
    if (emp) {
      emp.availability = availability;
      this.persist();
    }
  }
}

export const db = new PersistentDatabase();

