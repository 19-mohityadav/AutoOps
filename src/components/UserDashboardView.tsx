import React from 'react';
import { PlusCircle, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, Bot, MapPin, Tag } from 'lucide-react';
import { Issue } from '../types';

interface UserDashboardViewProps {
  issues: Issue[];
  onReportIssue: () => void;
  onSelectIssue: (issue: Issue) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  issues,
  onReportIssue,
  onSelectIssue,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold uppercase">Resolved</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold uppercase">In Progress</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-mono font-bold uppercase">Assigned</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-bold uppercase">Unassigned</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-bold text-[11px] uppercase">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold text-[11px] uppercase">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[11px] uppercase">Low</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top CTA Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-mono font-bold uppercase">
            <Bot className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Report a Problem</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Submit an operational issue or civic grievance and let the AutoOps autonomous decision engine categorize, prioritize, and assign it to the right specialist immediately.
          </p>
        </div>

        <button
          onClick={onReportIssue}
          className="z-10 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-teal-500/20 flex items-center space-x-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report Issue</span>
        </button>
      </div>

      {/* My Issues Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-teal-400" />
              <span>My Submitted Issues</span>
            </h3>
            <p className="text-xs text-slate-400">Track real-time autonomous routing and task resolution</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: {issues.length} Issues</span>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No issues submitted yet.</p>
            <button
              onClick={onReportIssue}
              className="text-xs font-bold text-teal-400 hover:underline uppercase tracking-wider font-mono"
            >
              Click here to report your first issue →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 rounded-2xl p-5 transition-all cursor-pointer group shadow-md hover:shadow-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-slate-500">#{issue.id.slice(-4)}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                      {issue.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(issue.priority)}
                    {getStatusBadge(issue.status)}
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{issue.description}</p>

                <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 font-mono">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{issue.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-teal-500" />
                      <span>{issue.category}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-teal-400 font-bold group-hover:translate-x-1 transition-transform text-[11px] uppercase">
                    <span>
                      {issue.assigned_employee_name
                        ? `Assigned to ${issue.assigned_employee_name}`
                        : 'Autonomous Processing'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
