import React, { useState } from 'react';
import { Building2, Users, Wrench, ChevronRight, Briefcase, CheckCircle2 } from 'lucide-react';
import { Department, Employee } from '../types';

interface DepartmentsViewProps {
  departments: Department[];
  employees: Employee[];
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ departments, employees }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || '');

  const selectedDept = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const deptEmployees = employees.filter((e) => e.department_id === selectedDept?.id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            <span>Operational Departments Directory</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Configured functional units for automated decision skill-mapping & task routing
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full uppercase">
          {departments.length} Configured Departments
        </span>
      </div>

      {/* Grid of Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const count = employees.filter((e) => e.department_id === dept.id).length;
          const totalActiveTasks = employees
            .filter((e) => e.department_id === dept.id)
            .reduce((sum, e) => sum + e.active_task_count, 0);

          const isSelected = dept.id === selectedDept?.id;

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 shadow-xl relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-950 text-teal-400 text-[10px] font-mono font-bold uppercase border border-slate-800">
                  {dept.category}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{count} Personnel</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{dept.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Active Workload:</span>
                <span className="font-bold text-amber-400">{totalActiveTasks} Tasks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Roster */}
      {selectedDept && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>{selectedDept.name} — Department Roster</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Personnel eligible for automated task assignments</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              {deptEmployees.length} Active Staff Members
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{emp.name}</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      emp.availability === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {emp.availability}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>{emp.email}</span>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {emp.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Current Active Tasks:</span>
                  <span className="font-bold text-teal-400">{emp.active_task_count} / {emp.max_capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
