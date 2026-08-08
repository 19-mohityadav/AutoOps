import React, { useState } from 'react';
import { X, Bot, Clock, UserCheck, ShieldAlert, CheckCircle2, UserPlus, AlertTriangle, Cpu, Layers } from 'lucide-react';
import { Issue, Task, DecisionLog, Employee, UserRole } from '../types';

interface IssueDetailModalProps {
  issue: Issue | null;
  task: Task | null;
  logs: DecisionLog[];
  employees: Employee[];
  currentRole: UserRole;
  onClose: () => void;
  onReassign: (issueId: string, employeeId: string, reason: string) => Promise<void>;
  onUpdateStatus: (issueId: string, status: string, resolutionNote?: string) => Promise<void>;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  task,
  logs,
  employees,
  currentRole,
  onClose,
  onReassign,
  onUpdateStatus,
}) => {
  const [selectedReassignEmp, setSelectedReassignEmp] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!issue) return null;

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReassignEmp || !reassignReason) return;
    setIsReassigning(true);
    try {
      await onReassign(issue.id, selectedReassignEmp, reassignReason);
      setShowOverrideForm(false);
      setReassignReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsReassigning(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await onUpdateStatus(issue.id, newStatus, statusNote);
      setStatusNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-white shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-500/10 p-2.5 rounded-xl text-teal-400 border border-teal-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Issue ID: {issue.id}</span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {issue.status}
                </span>
              </div>
              <h2 id="issue-modal-title" className="text-lg font-bold text-white line-clamp-1">{issue.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Issue Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Category</span>
              <span className="font-bold text-white text-sm">{issue.category}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{issue.subcategory}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Priority</span>
              <span className="font-bold text-amber-400 text-sm font-mono">{issue.priority}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Department</span>
              <span className="font-bold text-cyan-400 text-sm">{issue.department_name || 'Unassigned'}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Assigned To</span>
              <span className="font-bold text-emerald-400 text-sm">
                {issue.assigned_employee_name || 'UNASSIGNED'}
              </span>
            </div>
          </div>

          {/* Issue Location & Description */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Location & Details:
            </div>
            <div className="text-slate-300 font-medium">{issue.location}</div>
            <p className="text-slate-400 text-xs leading-relaxed">{issue.description}</p>
          </div>

          {/* SECTION 1: EXPLAINABLE DECISION PANEL */}
          <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-5 space-y-3 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <Cpu className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">AI Decision Rationale</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-teal-400 uppercase tracking-wider text-[10px] block">
                  AI Classification
                </span>
                <p className="text-slate-300 leading-relaxed">{issue.classification_reason}</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider text-[10px] block">
                  Assignment Rationale
                </span>
                <p className="text-slate-300 leading-relaxed">{issue.assignment_reason}</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: AUTOMATION TIMELINE */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Activity Timeline</h3>
            </div>

            <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="relative group">
                  <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-teal-400 ring-4 ring-slate-950" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{log.step_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.decision && (
                    <div className="text-xs font-mono font-medium text-teal-400 mt-0.5">{log.decision}</div>
                  )}
                  {log.reason && log.reason !== log.decision && (
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{log.reason}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: HUMAN OVERRIDE & STATUS UPDATE CONTROLS */}
          {(currentRole === 'ADMIN' || currentRole === 'EMPLOYEE') && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Status Management & Human Override</h3>
                </div>
                {currentRole === 'ADMIN' && (
                  <button
                    onClick={() => setShowOverrideForm(!showOverrideForm)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-colors uppercase font-mono tracking-wider"
                  >
                    {showOverrideForm ? 'Cancel Override' : 'Admin Reassign Override'}
                  </button>
                )}
              </div>

              {/* Status Change Buttons */}
              <div className="space-y-3">
                <div className="text-xs text-slate-400 font-mono uppercase">Update Task Status:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={updatingStatus}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors uppercase font-mono tracking-wider"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    disabled={updatingStatus}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-colors uppercase font-mono tracking-wider"
                  >
                    Mark Resolved
                  </button>
                </div>

                {(issue.status === 'RESOLVED' || task?.resolution_note) && (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="font-mono font-bold text-emerald-400 block mb-1">Resolution Note:</span>
                    <p>{task?.resolution_note || 'Task completed successfully.'}</p>
                  </div>
                )}
              </div>

              {/* Reassign Override Form (Admin Only) */}
              {showOverrideForm && currentRole === 'ADMIN' && (
                <form onSubmit={handleReassignSubmit} className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Admin Exception Handler — Manual Reassignment
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Employee</label>
                      <select
                        value={selectedReassignEmp}
                        onChange={(e) => setSelectedReassignEmp(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">Select Employee...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.department_name} - {emp.active_task_count} active)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Override Reason</label>
                      <input
                        type="text"
                        required
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        placeholder="e.g. Urgent priority shift by administrator..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isReassigning}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs tracking-wider uppercase shadow-md"
                  >
                    Confirm Reassignment Override
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

