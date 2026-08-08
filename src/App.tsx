import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IssueForm } from './components/IssueForm';
import { IssuesListView } from './components/IssuesListView';
import { IssueDetailModal } from './components/IssueDetailModal';
import { MyTasksView } from './components/MyTasksView';
import { TeamWorkloadView } from './components/TeamWorkloadView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { UserDashboardView } from './components/UserDashboardView';
import { AutomationCenterView } from './components/AutomationCenterView';
import { DepartmentsView } from './components/DepartmentsView';
import { DemoTestingView } from './components/DemoTestingView';
import { AiProcessingModal } from './components/AiProcessingModal';
import { Issue, Task, DecisionLog, Employee, Department, DashboardStats, UserRole } from './types';

export default function App() {
  const tabToPath = (tab: string): string => {
    switch (tab) {
      case 'landing': return '/';
      case 'login': return '/login';
      case 'user-dashboard': return '/my-issues';
      case 'my-tasks': return '/my-tasks';
      case 'dashboard': return '/dashboard';
      case 'issues': return '/issues';
      case 'automation': return '/automation';
      case 'team': return '/team';
      case 'departments': return '/departments';
      case 'demo': return '/demo';
      case 'submit': return '/report';
      default: return '/';
    }
  };

  const pathToTab = (path: string): string => {
    const p = path.toLowerCase().replace(/\/$/, '');
    switch (p) {
      case '/login': return 'login';
      case '/my-issues': return 'user-dashboard';
      case '/my-tasks': return 'my-tasks';
      case '/dashboard':
      case '/overview': return 'dashboard';
      case '/issues': return 'issues';
      case '/automation': return 'automation';
      case '/team': return 'team';
      case '/departments': return 'departments';
      case '/demo': return 'demo';
      case '/report':
      case '/submit': return 'submit';
      case '':
      case '/':
      default: return 'landing';
    }
  };

  const [activeTab, setActiveTabState] = useState<string>(() => pathToTab(window.location.pathname));

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const newPath = tabToPath(tab);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab }, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(pathToTab(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [currentRole, setCurrentRole] = useState<UserRole>('CITIZEN');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('autoops_auth_token'));
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState<string | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [logs, setLogs] = useState<DecisionLog[]>([]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<DecisionLog[]>([]);

  // AI Processing Modal
  const [processingModalIssue, setProcessingModalIssue] = useState<Issue | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Active employee for "My Tasks" view (matched to current logged in employee or default to Aman)
  const currentEmployee =
    employees.find((e) => (currentUserEmployeeId && e.id === currentUserEmployeeId) || (currentUserEmail && e.email === currentUserEmail)) ||
    employees.find((e) => e.name.includes('Aman')) ||
    employees[0];

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAllData = async () => {
    try {
      const [statsRes, issuesRes, tasksRes, empRes, deptRes, logsRes] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/issues').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/employees').then((r) => r.json()),
        fetch('/api/departments').then((r) => r.json()),
        fetch('/api/logs').then((r) => r.json()),
      ]);

      setStats(statsRes);
      setIssues(issuesRes);
      setTasks(tasksRes);
      setEmployees(empRes);
      setDepartments(deptRes);
      setLogs(logsRes);
    } catch (err) {
      console.error('Error fetching data:', err);
      addToast('error', 'Network Error', 'Failed to synchronize with server.');
    }
  };

  useEffect(() => {
    fetchAllData();

    // Verify existing auth token on startup
    const existingToken = localStorage.getItem('autoops_auth_token');
    if (existingToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${existingToken}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          if (data.user) {
            setCurrentRole(data.user.role);
            setCurrentUserEmail(data.user.email);
            if (data.user.employeeId) {
              setCurrentUserEmployeeId(data.user.employeeId);
            }
            setIsLoggedIn(true);
            setAuthToken(existingToken);
          }
        })
        .catch(() => {
          localStorage.removeItem('autoops_auth_token');
          setAuthToken(null);
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleRunScenario = async (scenarioId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scenarios/run', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ scenarioId }),
      }).then((r) => r.json());

      await fetchAllData();

      if (res.issue) {
        setProcessingModalIssue(res.issue);
        const assigned = res.issue.assigned_employee_name || 'UNASSIGNED';
        addToast(
          assigned !== 'UNASSIGNED' ? 'success' : 'error',
          `Scenario ${scenarioId} Triggered`,
          `Assigned to: ${assigned}`
        );
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Execution Error', 'Scenario execution failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitIssue = async (formData: {
    title: string;
    description: string;
    location: string;
    contact_info?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      }).then((r) => r.json());

      await fetchAllData();

      if (res.issue) {
        setProcessingModalIssue(res.issue);
        const assigned = res.issue.assigned_employee_name || 'UNASSIGNED';
        addToast(
          assigned !== 'UNASSIGNED' ? 'success' : 'info',
          'Issue Created & Auto-Assigned',
          `Assigned to: ${assigned}`
        );
      }
      return res;
    } catch (err) {
      console.error(err);
      addToast('error', 'Submission Failed', 'Could not create issue.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIssue = async (issue: Issue) => {
    setSelectedIssue(issue);
    // Find corresponding task & logs
    const task = tasks.find((t) => t.issue_id === issue.id) || null;
    setSelectedTask(task);

    const issueLogs = logs.filter((l) => l.issue_id === issue.id);
    setSelectedLogs(issueLogs);
  };

  const handleResetData = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      await fetchAllData();
      addToast('success', 'Database Reseeded', 'Reset all state to initial demo seeds.');
    } catch (err) {
      addToast('error', 'Reset Failed', 'Could not reseed database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIssueStatus = async (
    issueId: string,
    status: string,
    resolutionNote?: string
  ) => {
    try {
      await fetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, resolutionNote }),
      });
      await fetchAllData();
      addToast('success', 'Task Updated', `Status changed to ${status}`);
    } catch (err) {
      addToast('error', 'Update Error', 'Failed to update task status.');
    }
  };

  const handleReassignIssue = async (
    issueId: string,
    employeeId: string,
    reason: string
  ) => {
    try {
      await fetch(`/api/issues/${issueId}/reassign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ employeeId, reason }),
      });
      await fetchAllData();
      addToast('success', 'Task Reassigned', 'Successfully reassigned task.');
      if (selectedIssue && selectedIssue.id === issueId) {
        const updated = issues.find((i) => i.id === issueId);
        if (updated) setSelectedIssue(updated);
      }
    } catch (err) {
      addToast('error', 'Reassign Error', 'Failed to reassign task.');
    }
  };

  const handleToggleAvailability = async (
    employeeId: string,
    availability: string
  ) => {
    try {
      await fetch(`/api/employees/${employeeId}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ availability }),
      });
      await fetchAllData();
      addToast('info', 'Staff Availability Updated', `Set status to ${availability}`);
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not change staff availability.');
    }
  };

  const handleReportIssueClick = () => {
    if (!isLoggedIn) {
      setRedirectAfterLogin('submit');
      setActiveTab('login');
      addToast('info', 'Sign In Required', 'Please log in or sign in to submit an issue.');
    } else {
      setActiveTab('submit');
    }
  };

  const handleLoginSuccess = (role: UserRole, email: string, token?: string, userDetails?: any) => {
    setCurrentRole(role);
    setCurrentUserEmail(email);
    if (userDetails?.employeeId) {
      setCurrentUserEmployeeId(userDetails.employeeId);
    } else {
      setCurrentUserEmployeeId(null);
    }
    setIsLoggedIn(true);

    if (token) {
      setAuthToken(token);
      localStorage.setItem('autoops_auth_token', token);
    }

    addToast('success', 'Signed In', `Signed in as ${role} (${email})`);
    
    if (redirectAfterLogin) {
      setActiveTab(redirectAfterLogin);
      setRedirectAfterLogin(null);
    } else {
      if (role === 'EMPLOYEE') {
        setActiveTab('my-tasks');
      } else if (role === 'ADMIN') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('user-dashboard');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}

    localStorage.removeItem('autoops_auth_token');
    setAuthToken(null);
    setIsLoggedIn(false);
    setCurrentRole('CITIZEN');
    setCurrentUserEmail('');
    setCurrentUserEmployeeId(null);
    setActiveTab('landing');
    addToast('info', 'Signed Out', 'You have been signed out.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLoginClick={() => setActiveTab('login')}
        onReportIssueClick={handleReportIssueClick}
        selectedEmployeeName={currentEmployee?.name || 'Aman Verma'}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} onClose={removeToast} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'landing' && (
          <LandingPage
            onReportIssue={handleReportIssueClick}
            onLogin={() => setActiveTab('login')}
            onTrackIssue={() => {
              if (isLoggedIn) setActiveTab('user-dashboard');
              else setActiveTab('login');
            }}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'user-dashboard' && (
          <UserDashboardView
            issues={issues}
            onReportIssue={handleReportIssueClick}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {/* ADMIN VIEWS WITH AUTHORIZATION GUARD */}
        {['dashboard', 'automation', 'issues', 'team', 'departments', 'demo'].includes(activeTab) && (!isLoggedIn || currentRole !== 'ADMIN') ? (
          <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto font-bold">
              🔒
            </div>
            <h3 className="text-xl font-bold text-white">Admin Authorization Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Command operator access is required to view operational analytics, personnel workloads, and system automation tools.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setRedirectAfterLogin(activeTab);
                  setActiveTab('login');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20"
              >
                Sign In as Admin
              </button>
              <button
                onClick={() => setActiveTab('landing')}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-semibold"
              >
                Return to Home Page
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                issues={issues}
                logs={logs}
                onSelectIssue={handleSelectIssue}
              />
            )}

            {activeTab === 'automation' && (
              <AutomationCenterView
                issues={issues}
                onSelectIssue={handleSelectIssue}
              />
            )}

            {activeTab === 'issues' && (
              <IssuesListView
                issues={issues}
                onSelectIssue={handleSelectIssue}
              />
            )}

            {activeTab === 'team' && (
              <TeamWorkloadView
                employees={employees}
                issues={issues}
                onToggleAvailability={handleToggleAvailability}
              />
            )}

            {activeTab === 'departments' && (
              <DepartmentsView
                departments={departments}
                employees={employees}
              />
            )}

            {activeTab === 'demo' && (
              <DemoTestingView
                onRunScenario={handleRunScenario}
                onResetData={handleResetData}
                isLoading={isLoading}
                issues={issues}
                logs={logs}
                onSelectIssue={handleSelectIssue}
              />
            )}
          </>
        )}

        {activeTab === 'submit' && (
          <IssueForm
            onSubmitIssue={handleSubmitIssue}
            onSelectIssue={handleSelectIssue}
          />
        )}

        {/* EMPLOYEE TASK VIEW WITH AUTHORIZATION GUARD */}
        {activeTab === 'my-tasks' && (
          !isLoggedIn || currentRole !== 'EMPLOYEE' ? (
            <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto font-bold">
                🛠️
              </div>
              <h3 className="text-xl font-bold text-white">Employee Authorization Required</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Field specialist authorization is required to access assigned tasks and complete operational workflows.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setRedirectAfterLogin('my-tasks');
                    setActiveTab('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20"
                >
                  Sign In as Field Specialist
                </button>
                <button
                  onClick={() => setActiveTab('landing')}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-semibold"
                >
                  Return to Home Page
                </button>
              </div>
            </div>
          ) : (
            <MyTasksView
              currentEmployee={currentEmployee}
              issues={issues}
              tasks={tasks}
              onSelectIssue={handleSelectIssue}
              onUpdateStatus={handleUpdateIssueStatus}
            />
          )
        )}
      </main>

      {/* AI Processing Screen Modal (Live Animation) */}
      {processingModalIssue && (
        <AiProcessingModal
          issue={processingModalIssue}
          onClose={() => setProcessingModalIssue(null)}
          onViewIssueDetails={handleSelectIssue}
        />
      )}

      {/* Detail & Decision Explainability Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          task={selectedTask}
          logs={selectedLogs}
          employees={employees}
          currentRole={currentRole}
          onClose={() => setSelectedIssue(null)}
          onReassign={handleReassignIssue}
          onUpdateStatus={handleUpdateIssueStatus}
        />
      )}
    </div>
  );
}
