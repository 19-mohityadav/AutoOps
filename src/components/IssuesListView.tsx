import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, CheckCircle2, Clock, Eye, AlertOctagon, RefreshCw } from 'lucide-react';
import { Issue, IssueCategory, IssuePriority, IssueStatus } from '../types';

interface IssuesListViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onRefresh: () => void;
}

export const IssuesListView: React.FC<IssuesListViewProps> = ({ issues, onSelectIssue, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredIssues = issues.filter((issue) => {
    if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && issue.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchLoc = issue.location.toLowerCase().includes(q);
      const matchAssigned = issue.assigned_employee_name?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc || matchAssigned;
    }
    return true;
  });

  const getPriorityBadge = (priority: IssuePriority) => {
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

  const getStatusBadge = (status: IssueStatus) => {
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
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search issue title, location, or assignee..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Road">Road</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Garbage">Garbage</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Maintenance">Maintenance</option>
              <option value="IT">IT</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>

            <button
              onClick={onRefresh}
              aria-label="Refresh issues list"
              className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Issues List Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile Card List View (< md) */}
        <div className="block md:hidden divide-y divide-slate-800/80 p-3 space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm font-mono">
              No matching issues found for selected filters.
            </div>
          ) : (
            filteredIssues.map((issue) => (
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

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                  <div className="space-y-0.5">
                    <div className="text-slate-400">
                      Dept: <span className="text-slate-200 font-medium">{issue.department_name || 'Unassigned'}</span>
                    </div>
                    <div className="text-slate-400">
                      Assigned: {issue.assigned_employee_name ? (
                        <span className="text-emerald-400 font-medium">{issue.assigned_employee_name}</span>
                      ) : (
                        <span className="text-rose-400 font-mono font-bold">UNASSIGNED</span>
                      )}
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="text-right pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIssue(issue);
                    }}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Why Assigned?</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Issue Details</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Assigned To</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm font-mono">
                    No matching issues found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">
                        {issue.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{issue.location}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                        {issue.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getPriorityBadge(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">
                      {issue.department_name || 'Unassigned'}
                    </td>

                    <td className="px-4 py-3.5 text-xs font-medium">
                      {issue.assigned_employee_name ? (
                        <span className="text-emerald-400">{issue.assigned_employee_name}</span>
                      ) : (
                        <span className="text-rose-400 font-mono font-bold">UNASSIGNED</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue(issue);
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-400 hover:text-teal-300 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Why Assigned?</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

