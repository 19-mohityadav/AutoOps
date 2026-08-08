import React from 'react';
import { Users, Layers, ShieldCheck, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Employee, Department } from '../types';

interface TeamWorkloadViewProps {
  employees: Employee[];
  departments: Department[];
  onToggleAvailability: (employeeId: string, currentStatus: string) => Promise<void>;
}

export const TeamWorkloadView: React.FC<TeamWorkloadViewProps> = ({
  employees,
  departments,
  onToggleAvailability,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-500/10 p-2.5 rounded-xl border border-teal-500/30 text-teal-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Department Staffing & Workload Matrix</h1>
            <p className="text-xs text-slate-400">
              Manage personnel availability, skill profiles, and active workloads. Toggle availability to test autonomous routing edge cases (e.g. Scenario 4: Overloaded or unavailable teams).
            </p>
          </div>
        </div>
      </div>

      {/* Departments Grouping */}
      <div className="space-y-6">
        {departments.map((dept) => {
          const deptEmployees = employees.filter((e) => e.department_id === dept.id);

          return (
            <div key={dept.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-teal-400" />
                  <h2 className="text-base font-bold text-white">{dept.name}</h2>
                  <span className="text-xs text-slate-400 font-mono">({dept.category})</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  {deptEmployees.length} Personnel
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deptEmployees.map((emp) => {
                  const isAvailable = emp.availability === 'AVAILABLE';
                  const capacityPercent = Math.round((emp.active_task_count / emp.max_capacity) * 100);

                  return (
                    <div
                      key={emp.id}
                      className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3 relative hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-white">{emp.name}</h3>
                          <span className="text-[11px] font-mono text-slate-400 block">{emp.email}</span>
                        </div>

                        {/* Availability Toggle */}
                        <button
                          onClick={() => onToggleAvailability(emp.id, emp.availability)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                            isAvailable
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{isAvailable ? 'Available' : 'Unavailable'}</span>
                        </button>
                      </div>

                      {/* Workload Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-mono text-[11px]">Active Tasks:</span>
                          <span className="font-mono font-bold text-slate-200 text-[11px]">
                            {emp.active_task_count} / {emp.max_capacity}
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                          <div
                            className={`h-1.5 rounded-full ${
                              capacityPercent >= 100
                                ? 'bg-rose-500'
                                : capacityPercent >= 60
                                ? 'bg-amber-500'
                                : 'bg-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, capacityPercent)}%` }}
                          />
                        </div>
                      </div>

                      {/* Skill Badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {emp.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

