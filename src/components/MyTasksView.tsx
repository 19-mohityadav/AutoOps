import React, { useState } from 'react';
import { CheckSquare, Clock, CheckCircle2, User, AlertCircle, ArrowRight, MapPin, Check } from 'lucide-react';
import { Issue, Task, Employee } from '../types';

interface MyTasksViewProps {
  currentEmployee: Employee | undefined;
  issues: Issue[];
  tasks: Task[];
  onSelectIssue: (issue: Issue) => void;
  onUpdateStatus: (issueId: string, status: string, resolutionNote?: string) => Promise<void>;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  currentEmployee,
  issues,
  tasks,
  onSelectIssue,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [resolutionNoteMap, setResolutionNoteMap] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Issue | null>(null);

  if (!currentEmployee) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 max-w-xl mx-auto my-12">
        <User className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">No Employee Logged In</h3>
        <p className="text-xs text-slate-400 mt-1">
          Please sign in as a Field Employee to view your assigned work orders.
        </p>
      </div>
    );
  }

  const assignedIssues = issues.filter((i) => i.assigned_employee_id === currentEmployee.id);
  
  const activeTasksCount = assignedIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

  const filteredIssues = assignedIssues.filter((issue) => {
    if (filter === 'IN_PROGRESS') return issue.status === 'IN_PROGRESS' || issue.status === 'ASSIGNED';
    if (filter === 'COMPLETED') return issue.status === 'RESOLVED' || issue.status === 'CLOSED';
    return true;
  });

  const handleStartTask = async (issueId: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(issueId, 'IN_PROGRESS');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveTask = async (issueId: string) => {
    const note = resolutionNoteMap[issueId] || 'Issue resolved on site.';
    setIsUpdating(true);
    try {
      await onUpdateStatus(issueId, 'RESOLVED', note);
    } finally {
      setIsUpdating(false);
    }
  };

  const firstName = currentEmployee.name.split(' ')[0].toUpperCase();

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Employee Greeting Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            GOOD MORNING, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-teal-400 font-semibold mt-1">
            You have <span className="font-bold underline">{activeTasksCount} active tasks</span> assigned to you today.
          </p>
        </div>

        {/* Task Filter Tabs - Horizontally scrollable on mobile */}
        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold shrink-0 min-w-max">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap min-h-[38px] ${
                filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Tasks ({assignedIssues.length})
            </button>
            <button
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap min-h-[38px] ${
                filter === 'IN_PROGRESS' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap min-h-[38px] ${
                filter === 'COMPLETED' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Task List / Focused View */}
      {filteredIssues.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 shadow-xl space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">You're all caught up</h3>
          <p className="text-xs text-slate-400">No active tasks found in this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredIssues.map((issue) => {
            const isCriticalOrHigh = issue.priority === 'Critical' || issue.priority === 'High';

            return (
              <div
                key={issue.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl hover:border-slate-700 transition-colors"
              >
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                      isCriticalOrHigh
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {issue.priority} Priority
                  </span>

                  <span className="text-xs font-mono text-slate-500">
                    Assigned {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Title & Details */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{issue.title}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{issue.location}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed pt-1">{issue.description}</p>
                </div>

                {/* Why assigned simple box */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <span className="font-mono font-bold text-teal-400 block text-[11px] uppercase">
                    Why you were selected:
                  </span>
                  <p className="leading-relaxed text-slate-300 text-xs">{issue.assignment_reason}</p>
                </div>

                {/* Task Workflow Actions */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {issue.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleStartTask(issue.id)}
                      disabled={isUpdating}
                      className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Start Task</span>
                    </button>
                  )}

                  {issue.status === 'IN_PROGRESS' && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                      <input
                        type="text"
                        placeholder="Resolution note (e.g. Repaired street light bulb & wiring)..."
                        value={resolutionNoteMap[issue.id] || ''}
                        onChange={(e) => setResolutionNoteMap({ ...resolutionNoteMap, [issue.id]: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 flex-1"
                      />
                      <button
                        onClick={() => handleResolveTask(issue.id)}
                        disabled={isUpdating}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 shrink-0"
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Task</span>
                      </button>
                    </div>
                  )}

                  {issue.status === 'RESOLVED' && (
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Task Completed</span>
                    </div>
                  )}

                  <button
                    onClick={() => onSelectIssue(issue)}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 shrink-0 self-end sm:self-auto"
                  >
                    <span>View Task Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
