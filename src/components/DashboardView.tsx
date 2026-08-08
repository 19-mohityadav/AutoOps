import React from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Layers,
  Activity,
  Bot,
  ArrowRight,
  Cpu,
  BrainCircuit,
  CheckSquare,
  Users
} from 'lucide-react';
import { DashboardStats, Issue } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onNavigateSubmit: () => void;
  onNavigateIssues: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  issues,
  onSelectIssue,
  onNavigateSubmit,
  onNavigateIssues,
}) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono';
      case 'Medium':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30 font-mono';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30 font-mono';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono';
      case 'UNASSIGNED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold font-mono animate-pulse';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30 font-mono';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h1 className="text-xl font-black text-white tracking-tight">
                Autonomous Task Assignment & Decision Control
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Zero-latency operational routing. Every issue is analyzed by Gemini 3.6 Flash, evaluated against department skills, availability, and active workload, and instantly auto-assigned to the best employee.
            </p>
          </div>
          <button
            onClick={onNavigateSubmit}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition-all shrink-0"
          >
            <Bot className="w-4 h-4" />
            <span>Test Autonomous Submission</span>
          </button>
        </div>

        {/* Complete Working Flow Stepper */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-bold mb-3 flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 shrink-0" />
            <span>End-to-End Autonomous Pipeline Architecture</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-[11px]">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold block">01. SUBMIT</span>
              <span className="text-slate-200 font-medium block">Issue Submitted</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold block">02. AI PARSE</span>
              <span className="text-slate-200 font-medium block">Category & Priority</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold block">03. DECISION</span>
              <span className="text-slate-200 font-medium block">Filter Department</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold block">04. STATUS</span>
              <span className="text-slate-200 font-medium block">Check Active Staff</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold block">05. MATCH</span>
              <span className="text-slate-200 font-medium block">Workload & Skills</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold block">06. AUTO TASK</span>
              <span className="text-slate-200 font-medium block">Task Created</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-teal-400 font-mono font-bold block">07. FIELD</span>
              <span className="text-slate-200 font-medium block">Employee Dashboard</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-emerald-500/30 text-center space-y-1 bg-emerald-500/5">
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">08. RESOLVED</span>
              <span className="text-emerald-300 font-medium block">Metrics Updated</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Issues</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.total_issues ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Processed automatically</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">Unassigned</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats?.unassigned_issues ?? 0}</div>
          <p className="text-[11px] text-rose-400/80 mt-1">Capacity alert / fallback</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Assigned</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{stats?.assigned_issues ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Auto-assigned to staff</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats?.in_progress_issues ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active field work</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats?.resolved_issues ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Completed & closed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Critical / High</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.critical_high_issues ?? 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">High priority items</p>
        </div>
      </div>

      {/* Main Grid Section: Live Feed + Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Autonomous Decisions Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-bold text-white">Recent Autonomous Operational Decisions</h2>
            </div>
            <button
              onClick={onNavigateIssues}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Card List View (< md) */}
          <div className="block md:hidden space-y-3">
            {issues.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2.5 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-slate-100 text-xs line-clamp-1">{issue.title}</div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${getPriorityBadge(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1">{issue.location}</div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-400 font-mono">Assigned:</span>
                    {issue.assigned_employee_name ? (
                      <span className="text-emerald-400 font-medium">{issue.assigned_employee_name}</span>
                    ) : (
                      <span className="text-rose-400 font-mono font-bold">UNASSIGNED</span>
                    )}
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="text-right pt-0.5">
                  <span className="text-[11px] text-teal-400 font-semibold inline-flex items-center space-x-1">
                    <span>Why assigned?</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase font-mono tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5 rounded-l-xl">Issue</th>
                  <th className="px-3.5 py-2.5">Category</th>
                  <th className="px-3.5 py-2.5">Priority</th>
                  <th className="px-3.5 py-2.5">Auto Assigned To</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 rounded-r-xl text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {issues.slice(0, 5).map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-3.5 py-3 font-semibold text-slate-200">
                      <div className="line-clamp-1 max-w-xs">{issue.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{issue.location}</div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                        {issue.category}
                      </span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getPriorityBadge(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-300 font-medium text-xs">
                      {issue.assigned_employee_name ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>{issue.assigned_employee_name}</span>
                        </div>
                      ) : (
                        <span className="text-rose-400 font-mono font-bold text-[11px]">UNASSIGNED</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <span className="text-xs text-teal-400 group-hover:underline font-semibold">
                        Why assigned?
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Department Workload Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Department Active Capacity</h2>
          </div>

          <div className="space-y-4">
            {stats?.department_workload.map((dept) => {
              const totalCapacity = dept.employee_count * 5;
              const usagePercent = totalCapacity > 0 ? Math.min(100, Math.round((dept.active_tasks / totalCapacity) * 100)) : 0;

              return (
                <div key={dept.department_name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{dept.department_name}</span>
                    <span className="text-slate-400 font-mono">
                      {dept.active_tasks} / {totalCapacity} tasks ({usagePercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        usagePercent >= 90
                          ? 'bg-rose-500'
                          : usagePercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

