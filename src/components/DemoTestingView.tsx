import React from 'react';
import { Zap, Construction, Lightbulb, Trash2, AlertOctagon, ArrowRight, RotateCcw, ShieldAlert, Cpu, FileCheck } from 'lucide-react';
import { Issue, Task, DecisionLog } from '../types';

interface DemoTestingViewProps {
  onRunScenario: (scenarioId: string) => void;
  onResetData: () => void;
  isLoading: boolean;
  issues: Issue[];
  logs: DecisionLog[];
  onSelectIssue: (issue: Issue) => void;
}

export const DemoTestingView: React.FC<DemoTestingViewProps> = ({
  onRunScenario,
  onResetData,
  isLoading,
  issues,
  logs,
  onSelectIssue,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold uppercase mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Admin Operator Sandbox</span>
          </div>
          <h2 className="text-2xl font-black text-white">Demo & System Testing Center</h2>
          <p className="text-xs text-slate-400 font-mono">
            Trigger automated end-to-end scenarios to test decision rules & workload algorithms
          </p>
        </div>

        <button
          onClick={onResetData}
          className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Reset System Seed Data</span>
        </button>
      </div>

      {/* Preset Test Scenarios */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <span>Automated Test Scenarios</span>
          </h3>
          <p className="text-xs text-slate-400">
            Select a pre-configured operational test case to trigger immediate AI understanding & automatic assignment
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Scenario 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Construction className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Scenario 1: Road Pothole</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tests Road Repair skill match, Road Maintenance department routing, and capacity check.
              </p>
            </div>
            <button
              onClick={() => onRunScenario('1')}
              disabled={isLoading}
              className="w-full mt-2 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <span>Run Scenario 1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Scenario 2: Street Light</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tests Electrical Repair skill match & Electrical Maintenance assignment.
              </p>
            </div>
            <button
              onClick={() => onRunScenario('2')}
              disabled={isLoading}
              className="w-full mt-2 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <span>Run Scenario 2</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 3 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Scenario 3: Garbage Overflow</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tests Sanitation skill match & Sanitation Department load balancing.
              </p>
            </div>
            <button
              onClick={() => onRunScenario('3')}
              disabled={isLoading}
              className="w-full mt-2 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <span>Run Scenario 3</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 4 */}
          <div className="bg-slate-950 border border-rose-900/50 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Scenario 4: All Personnel Busy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tests edge case fallback when all eligible staff are at maximum workload capacity.
              </p>
            </div>
            <button
              onClick={() => onRunScenario('4')}
              disabled={isLoading}
              className="w-full mt-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <span>Run Scenario 4</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Decision Audit Log Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              <span>System Decision Log Feed ({logs.length})</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">Real-time audit trail of every automated execution step</p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-teal-400 font-bold">LOG #{log.id}</span>
                <span className="text-[10px]">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-200 font-sans text-xs">{log.action_summary}</p>
              <div className="text-[11px] text-slate-400 pt-1">Reason: {log.rationale}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
