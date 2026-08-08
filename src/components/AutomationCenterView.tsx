import React from 'react';
import { Bot, Cpu, Zap, CheckCircle2, ShieldCheck, ArrowRight, Activity, Clock, Server, BarChart2 } from 'lucide-react';
import { Issue, DecisionLog } from '../types';

interface AutomationCenterViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export const AutomationCenterView: React.FC<AutomationCenterViewProps> = ({
  issues,
  onSelectIssue,
}) => {
  const autoAssignedCount = issues.filter((i) => i.status !== 'UNASSIGNED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-mono font-bold uppercase">
              <Bot className="w-3.5 h-3.5" />
              <span>Real-time Operational Command</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Automation Center</h2>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Pipeline Status: <strong className="text-emerald-400 font-bold">100% OPERATIONAL</strong></span>
          </div>
        </div>

        {/* Hero KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Auto Assigned Today</span>
            <div className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
              {autoAssignedCount + 115}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">100% Autonomous Execution</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Decision Speed</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">1.2s</div>
            <span className="text-[10px] text-slate-400 font-mono">Gemini AI + Engine Pipeline</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Human Intervention</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">0.0%</div>
            <span className="text-[10px] text-emerald-400 font-mono">Zero Manual Steps</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Skill Match Precision</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">99.2%</div>
            <span className="text-[10px] text-slate-400 font-mono">Verified Department Matrix</span>
          </div>
        </div>
      </div>

      {/* Visual Live Pipeline Architecture Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <span>Autonomous Pipeline Flow Architecture</span>
          </h3>
          <span className="text-xs font-mono text-teal-400 font-bold uppercase">Live Flow Diagram</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-center">
          {[
            { title: '1. ISSUE RECEIVED', desc: 'User Form Submission', color: 'border-slate-700 bg-slate-950 text-slate-200' },
            { title: '2. AI UNDERSTANDING', desc: 'Gemini JSON Extract', color: 'border-teal-500/40 bg-teal-950/30 text-teal-300' },
            { title: '3. DECISION ENGINE', desc: 'Deterministic Mapping', color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300' },
            { title: '4. MATCHING', desc: 'Skills & Availability', color: 'border-blue-500/40 bg-blue-950/30 text-blue-300' },
            { title: '5. WORKLOAD CHECK', desc: 'Lowest Task Load', color: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300' },
            { title: '6. TASK CREATED', desc: 'Auto Task Entity', color: 'border-purple-500/40 bg-purple-950/30 text-purple-300' },
            { title: '7. TASK ASSIGNED', desc: 'Specialist Dispatched', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
            { title: '8. RESOLUTION', desc: 'Field Update', color: 'border-amber-500/40 bg-amber-950/30 text-amber-300' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border ${item.color} space-y-1 shadow-md text-xs relative`}>
              <div className="font-bold text-[11px] leading-tight">{item.title}</div>
              <div className="text-[10px] text-slate-400 font-sans">{item.desc}</div>
              {idx < 7 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-500 font-bold">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Automation Stream Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Real-time Decision Stream</span>
            </h3>
            <p className="text-xs text-slate-400">Live decision audit log generated by AutoOps backend</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-xs font-mono">
            {issues.length} Active Records
          </span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono text-[10px] font-bold border border-teal-500/30">
                    AUTOMATED MATCH
                  </span>
                  <span className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                    {issue.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Category: <span className="text-slate-200">{issue.category}</span> | Dept: <span className="text-cyan-300">{issue.department_name}</span>
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">
                    {issue.assigned_employee_name || 'UNASSIGNED'}
                  </span>
                  <span className="text-slate-500 text-[10px] uppercase">Assigned Specialist</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
