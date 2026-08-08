import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/database.js';
import { processAndAssignIssue, adminReassignIssue } from './src/server/decisionEngine.js';
import { generateToken, verifyToken, type TokenPayload } from './src/server/auth.js';
import { DashboardStats } from './src/types.js';

export { generateToken, verifyToken };
export type { TokenPayload };

// Simple Rate Limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(maxRequests = 30, windowMs = 60000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    }

    record.count++;
    return next();
  };
}

async function startServer() {
  // Validate environment security configuration
  if (!process.env.AUTOOPS_AUTH_SECRET || process.env.AUTOOPS_AUTH_SECRET.trim().length === 0) {
    console.warn('⚠️ AUTOOPS_AUTH_SECRET environment variable is not explicitly set. Generating a secure ephemeral 256-bit random key for token signing.');
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth Helper
  function getAuthUser(req: express.Request) {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    if (authHeader) {
      const payload = verifyToken(authHeader.toString());
      if (payload) {
        return {
          role: payload.role,
          email: payload.email,
          name: payload.name,
          employeeId: payload.employeeId,
          isAuthenticated: true
        };
      }
    }

    return {
      role: 'CITIZEN' as const,
      email: undefined,
      name: undefined,
      employeeId: undefined,
      isAuthenticated: false
    };
  }

  // Auth API
  app.post('/api/auth/login', rateLimiter(10, 60000), (req, res) => {
    const { email, password } = req.body;
    if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let role: 'ADMIN' | 'EMPLOYEE' | 'CITIZEN' = 'CITIZEN';
    let name = 'Citizen User';
    let employeeId: string | undefined = undefined;

    const existingUser = db.getUserByEmail(cleanEmail);
    const existingEmp = db.getEmployees().find(e => e.email.toLowerCase() === cleanEmail);

    if (existingEmp) {
      role = 'EMPLOYEE';
      name = existingEmp.name;
      employeeId = existingEmp.id;
    } else if (existingUser) {
      role = existingUser.role;
      name = existingUser.name;
      if (role === 'EMPLOYEE') {
        const emp = db.getEmployees().find(e => e.user_id === existingUser.id || e.email.toLowerCase() === cleanEmail);
        if (emp) employeeId = emp.id;
      }
    } else {
      if (cleanEmail.includes('admin')) {
        role = 'ADMIN';
        name = 'Admin Command Operator';
      } else if (cleanEmail.includes('aman') || cleanEmail === 'aman@autoops.gov' || cleanEmail === 'aman.v@civicops.gov') {
        role = 'EMPLOYEE';
        name = 'Aman Verma';
        employeeId = 'emp-aman';
      } else if (cleanEmail.includes('priya') || cleanEmail === 'priya@autoops.gov' || cleanEmail === 'priya.p@civicops.gov') {
        role = 'EMPLOYEE';
        name = 'Priya Patel';
        employeeId = 'emp-priya';
      } else if (cleanEmail.includes('deepak') || cleanEmail === 'deepak@autoops.gov' || cleanEmail === 'deepak.g@civicops.gov') {
        role = 'EMPLOYEE';
        name = 'Deepak Gupta';
        employeeId = 'emp-deepak';
      } else if (cleanEmail.includes('rahul') || cleanEmail === 'rahul.k@civicops.gov') {
        role = 'EMPLOYEE';
        name = 'Rahul Kumar';
        employeeId = 'emp-rahul';
      } else if (cleanEmail.includes('employee')) {
        role = 'EMPLOYEE';
        name = 'Field Specialist';
        employeeId = 'emp-aman';
      } else {
        role = 'CITIZEN';
        name = cleanEmail.split('@')[0] || 'Public Citizen';
      }

      db.addUser({
        id: `usr-${Date.now()}`,
        name,
        email: cleanEmail,
        role
      });
    }

    const token = generateToken({ email: cleanEmail, role, name, employeeId });

    res.json({
      token,
      user: {
        email: cleanEmail,
        role,
        name,
        employeeId
      }
    });
  });

  app.post('/api/auth/register', rateLimiter(10, 60000), (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRole: 'ADMIN' | 'EMPLOYEE' | 'CITIZEN' = role === 'ADMIN' ? 'ADMIN' : role === 'EMPLOYEE' ? 'EMPLOYEE' : 'CITIZEN';
    const userName = (name && typeof name === 'string' && name.trim()) ? name.trim() : cleanEmail.split('@')[0];

    let employeeId: string | undefined = undefined;
    if (userRole === 'EMPLOYEE') {
      const emp = db.getEmployees().find(e => e.email.toLowerCase() === cleanEmail);
      if (emp) {
        employeeId = emp.id;
      }
    }

    db.addUser({
      id: `usr-${Date.now()}`,
      name: userName,
      email: cleanEmail,
      role: userRole
    });

    const token = generateToken({ email: cleanEmail, role: userRole, name: userName, employeeId });

    res.status(201).json({
      token,
      user: {
        email: cleanEmail,
        role: userRole,
        name: userName,
        employeeId
      }
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const payload = verifyToken(authHeader.toString());
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    res.json({ user: payload });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Successfully logged out' });
  });

  // Seed / Reset Database
  const resetHandler = (req: express.Request, res: express.Response) => {
    const user = getAuthUser(req);
    if (!user.isAuthenticated) {
      return res.status(401).json({ error: 'Unauthenticated: Sign in required.' });
    }
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required to reset or reseed database.' });
    }
    db.seed();
    res.json({ message: 'Database successfully reseeded with default demo state.' });
  };
  app.post('/api/seed', resetHandler);
  app.post('/api/reset', resetHandler);

  // Dashboard Stats API
  const statsHandler = (req: express.Request, res: express.Response) => {
    const issues = db.getIssues();
    const employees = db.getEmployees();
    const departments = db.getDepartments();

    const categoryBreakdown: Record<string, number> = {};
    issues.forEach(i => {
      categoryBreakdown[i.category] = (categoryBreakdown[i.category] || 0) + 1;
    });

    const deptWorkload = departments.map(d => {
      const deptEmps = employees.filter(e => e.department_id === d.id);
      const activeTasks = deptEmps.reduce((acc, e) => acc + e.active_task_count, 0);
      return {
        department_name: d.name,
        active_tasks: activeTasks,
        employee_count: deptEmps.length
      };
    });

    const stats: DashboardStats = {
      total_issues: issues.length,
      unassigned_issues: issues.filter(i => i.status === 'UNASSIGNED').length,
      assigned_issues: issues.filter(i => i.status === 'ASSIGNED').length,
      in_progress_issues: issues.filter(i => i.status === 'IN_PROGRESS').length,
      resolved_issues: issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length,
      critical_high_issues: issues.filter(i => i.priority === 'Critical' || i.priority === 'High').length,
      category_breakdown: categoryBreakdown,
      department_workload: deptWorkload,
      avg_resolution_time_hours: 1.8
    };

    res.json(stats);
  };
  app.get('/api/stats', statsHandler);
  app.get('/api/dashboard/stats', statsHandler);

  // Tasks API
  app.get('/api/tasks', (req, res) => {
    res.json(db.getTasks());
  });

  // Decision Logs API
  app.get('/api/logs', (req, res) => {
    res.json(db.getDecisionLogs());
  });

  // Create Issue & Autonomous Assignment (Rate limited)
  app.post('/api/issues', rateLimiter(20, 60000), async (req, res) => {
    try {
      let { title, description, location, contact_info, image_url } = req.body;

      // Input Validation & Sanitization
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Issue title is required and must be text.' });
      }
      if (!description || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ error: 'Issue description is required and must be text.' });
      }
      if (!location || typeof location !== 'string' || !location.trim()) {
        return res.status(400).json({ error: 'Issue location is required and must be text.' });
      }

      title = title.trim().slice(0, 200);
      description = description.trim().slice(0, 2000);
      location = location.trim().slice(0, 300);
      contact_info = typeof contact_info === 'string' ? contact_info.trim().slice(0, 200) : undefined;
      image_url = typeof image_url === 'string' ? image_url.trim().slice(0, 1000) : undefined;

      const result = await processAndAssignIssue({
        title,
        description,
        location,
        contact_info,
        image_url
      });

      res.status(201).json(result);
    } catch (err: any) {
      console.error('Error in issue creation:', err);
      res.status(500).json({ error: 'Internal server error processing issue' });
    }
  });

  // Pre-configured Demo Scenarios
  const runScenario = async (scenarioId: string, res: express.Response) => {
    try {
      let payload = { title: '', description: '', location: '' };

      switch (scenarioId) {
        case '1':
          payload = {
            title: 'School Entrance Road Hazard',
            description: 'There is a huge pothole near the school entrance and vehicles are having difficulty passing.',
            location: 'St. Jude School Gate 1, Oak Street'
          };
          break;
        case '2':
          payload = {
            title: 'Street Light Outage',
            description: 'The street light outside Building A has stopped working for three days.',
            location: 'Building A, North Wing Residential Block'
          };
          break;
        case '3':
          payload = {
            title: 'Uncollected Trash Overflow',
            description: 'Garbage has not been collected for four days causing foul smell and health concerns.',
            location: 'Corner of 5th Avenue and Maple Street'
          };
          break;
        case '4':
          payload = {
            title: 'Public Security Emergency Threat',
            description: 'Urgent public security risk near North Gate station requires immediate dispatch.',
            location: 'North Gate Station Plaza'
          };
          break;
        default:
          return res.status(400).json({ error: 'Invalid scenario ID. Supported: 1, 2, 3, 4' });
      }

      const result = await processAndAssignIssue(payload);
      res.json({ scenario_id: scenarioId, ...result });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to execute test scenario' });
    }
  };

  app.post('/api/scenarios/run', rateLimiter(20, 60000), async (req, res) => {
    const scenarioId = String(req.body.scenarioId || req.body.scenario_id || '1');
    await runScenario(scenarioId, res);
  });

  app.post('/api/test-scenarios/:scenarioId', rateLimiter(20, 60000), async (req, res) => {
    await runScenario(req.params.scenarioId, res);
  });

  // List Issues with Filters
  app.get('/api/issues', (req, res) => {
    let issues = db.getIssues();

    const { category, priority, department, status, search, assignee } = req.query;

    if (category && category !== 'ALL') {
      issues = issues.filter(i => i.category === category);
    }
    if (priority && priority !== 'ALL') {
      issues = issues.filter(i => i.priority === priority);
    }
    if (department && department !== 'ALL') {
      issues = issues.filter(i => i.department_name === department || i.department_id === department);
    }
    if (status && status !== 'ALL') {
      issues = issues.filter(i => i.status === status);
    }
    if (assignee && assignee !== 'ALL') {
      issues = issues.filter(i => i.assigned_employee_id === assignee);
    }
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const query = search.toLowerCase().trim();
      issues = issues.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query) ||
        i.subcategory.toLowerCase().includes(query)
      );
    }

    res.json(issues);
  });

  // Get Single Issue Details
  app.get('/api/issues/:id', (req, res) => {
    const user = getAuthUser(req);
    const issue = db.getIssueById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (user.isAuthenticated && user.role === 'CITIZEN') {
      if (issue.contact_info && issue.contact_info.includes('@') && user.email) {
        if (!issue.contact_info.toLowerCase().includes(user.email.toLowerCase())) {
          return res.status(403).json({ error: 'Forbidden: You do not have permission to view another user issue details' });
        }
      }
    }

    const task = db.getTaskByIssueId(issue.id);
    const logs = db.getDecisionLogsByIssueId(issue.id);

    res.json({ issue, task, decision_logs: logs });
  });

  // Admin Manual Reassign
  app.post('/api/issues/:id/reassign', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user.isAuthenticated) {
        return res.status(401).json({ error: 'Unauthenticated: Sign in required.' });
      }
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin access required for manual reassignment.' });
      }

      const empId = req.body.employee_id || req.body.employeeId;
      const { reason } = req.body;
      if (!empId || typeof empId !== 'string' || !reason || typeof reason !== 'string') {
        return res.status(400).json({ error: 'employeeId and reason are required' });
      }

      const result = adminReassignIssue(req.params.id, empId.trim(), reason.trim().slice(0, 500));
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to reassign issue' });
    }
  });

  // Update Status
  app.patch('/api/issues/:id/status', (req, res) => {
    const user = getAuthUser(req);
    if (!user.isAuthenticated) {
      return res.status(401).json({ error: 'Unauthenticated: Sign in required.' });
    }

    const issue = db.getIssueById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (user.role === 'EMPLOYEE') {
      if (!user.employeeId || (issue.assigned_employee_id && issue.assigned_employee_id !== user.employeeId)) {
        return res.status(403).json({ error: 'Forbidden: Employees can only modify their own assigned tasks.' });
      }
    } else if (user.role === 'CITIZEN') {
      return res.status(403).json({ error: 'Forbidden: Citizens cannot modify operational task status.' });
    }

    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const note = (req.body.resolution_note || req.body.resolutionNote || '').toString().trim().slice(0, 1000);

    const oldStatus = issue.status;
    issue.status = status as any;
    issue.updated_at = new Date().toISOString();
    db.updateIssue(issue);

    let task = db.getTaskByIssueId(issue.id);
    if (task) {
      task.status = status as any;
      if (note) {
        task.resolution_note = note;
      }
      if (status === 'RESOLVED' || status === 'CLOSED') {
        task.resolved_at = new Date().toISOString();
        if (issue.assigned_employee_id) {
          db.updateEmployeeWorkload(issue.assigned_employee_id, -1);
        }
      }
      db.updateTask(task);
    }

    db.addDecisionLog({
      id: `log-${issue.id}-${Date.now()}`,
      issue_id: issue.id,
      timestamp: new Date().toISOString(),
      step_name: 'Status Updated',
      decision_type: 'WORKFLOW_STATUS',
      decision: `Status changed from ${oldStatus} to ${status}`,
      reason: note ? `Resolution Note: ${note}` : `Status updated by ${user.role}.`
    });

    res.json({ issue, task });
  });

  // Employees List & Management
  app.get('/api/employees', (req, res) => {
    res.json(db.getEmployees());
  });

  const employeeAvailabilityHandler = (req: express.Request, res: express.Response) => {
    const user = getAuthUser(req);
    if (!user.isAuthenticated) {
      return res.status(401).json({ error: 'Unauthenticated: Sign in required.' });
    }
    if (user.role === 'CITIZEN') {
      return res.status(403).json({ error: 'Forbidden: Admin or Employee access required.' });
    }
    if (user.role === 'EMPLOYEE' && user.employeeId !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden: Employees can only modify their own availability.' });
    }

    const { availability } = req.body;
    if (!availability || typeof availability !== 'string') {
      return res.status(400).json({ error: 'availability is required' });
    }

    const validAvailability = ['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE'];
    if (!validAvailability.includes(availability.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid availability state' });
    }

    db.updateEmployeeAvailability(req.params.id, availability.toUpperCase() as any);
    res.json(db.getEmployeeById(req.params.id));
  };

  app.patch('/api/employees/:id', employeeAvailabilityHandler);
  app.patch('/api/employees/:id/availability', employeeAvailabilityHandler);

  // Departments List
  app.get('/api/departments', (req, res) => {
    res.json(db.getDepartments());
  });

  // Vite Middleware for Dev / Static for Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Autonomous Decision System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

