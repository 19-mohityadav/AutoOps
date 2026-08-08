import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { Issue } from '../types';

interface AiProcessingModalProps {
  issue: Issue | null;
  onClose: () => void;
  onViewIssueDetails: (issue: Issue) => void;
}

const STEPS = [
  'Issue received',
  'Understanding the issue',
  'Determining priority',
  'Finding the right team',
  'Checking availability',
  'Assigning the task',
  'Assignment complete',
];

export const AiProcessingModal: React.FC<AiProcessingModalProps> = ({
  issue,
  onClose,
  onViewIssueDetails,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!issue) return;

    setCurrentStep(0);
    setIsCompleted(false);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => setIsCompleted(true), 350);
          return prev;
        }
      });
    }, 300);

    return () => clearInterval(interval);
  }, [issue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!issue) return null;

  const assignedFirstName = issue.assigned_employee_name
    ? issue.assigned_employee_name.split(' ')[0]
    : 'Personnel';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden my-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 animate-pulse" />

        {!isCompleted ? (
          /* Live Progress Timeline */
          <div className="space-y-6" aria-live="polite" aria-atomic="true">
            <div className="text-center space-y-2">
              <h2 id="modal-title" className="text-xl sm:text-2xl font-black text-white">AutoOps is handling your request</h2>
              <p className="text-xs text-slate-400">Processing in real time...</p>
            </div>


            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3.5">
              {STEPS.map((step, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={idx} className="flex items-center space-x-3 text-sm">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-800 shrink-0" />
                    )}

                    <span
                      className={`transition-colors ${
                        isPassed
                          ? 'text-emerald-300 font-medium'
                          : isCurrent
                          ? 'text-white font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Decision Completed Reveal Screen */
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ASSIGNMENT COMPLETE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Your issue has been assigned</h2>
            </div>

            {/* Clean Summary Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-xs font-mono text-slate-400">Issue:</span>
                <span className="text-xs font-bold text-white text-right">{issue.title}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-xs font-mono text-slate-400">Priority:</span>
                <span
                  className={`text-xs font-bold ${
                    issue.priority === 'Critical' || issue.priority === 'High'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {issue.priority}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-xs font-mono text-slate-400">Department:</span>
                <span className="text-xs font-bold text-slate-200">{issue.department_name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-xs font-mono text-slate-400">Assigned to:</span>
                <span className="text-xs font-bold text-emerald-400">
                  {issue.assigned_employee_name || 'UNASSIGNED'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/30">
                  {issue.status}
                </span>
              </div>
            </div>

            {/* Why section */}
            <div className="bg-slate-950 border border-teal-500/30 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Why {assignedFirstName}?</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                "{issue.assignment_reason || `${assignedFirstName} has the required skill, is available, and has the lowest current workload among eligible employees.`}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onViewIssueDetails(issue);
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Track My Issue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
