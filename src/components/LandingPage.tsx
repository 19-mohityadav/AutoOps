import React from 'react';
import { ArrowRight, CheckCircle2, UserCheck, ShieldCheck, MapPin, Tag, Wrench, FileText, Sparkles, Building2, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onReportIssue: () => void;
  onLogin: () => void;
  onTrackIssue: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onReportIssue,
  onLogin,
  onTrackIssue,
}) => {
  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 py-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-6 pb-10 rounded-3xl bg-slate-900/90 border border-slate-800/90 p-8 sm:p-12 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          From request to action,<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">automatically.</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          AutoOps understands incoming issues, makes the right operational decision, and automatically assigns the work to the right person.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onReportIssue}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Report an Issue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={scrollToHowItWorks}
            className="px-7 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm shadow-md flex items-center space-x-2 transition-all"
          >
            <span>See How It Works</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 4-Step Visual Workflow Section */}
      <div id="how-it-works" className="space-y-6 pt-4 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">How AutoOps Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            A seamless automated pipeline from initial submission to final issue resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 01 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl relative group hover:border-teal-500/50 transition-colors">
            <span className="text-2xl font-black text-teal-400/30 font-mono block">01</span>
            <h3 className="text-base font-bold text-teal-400 uppercase tracking-wider font-mono">REQUEST</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              A user reports an issue.
            </p>
          </div>

          {/* Card 02 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl relative group hover:border-cyan-500/50 transition-colors">
            <span className="text-2xl font-black text-cyan-400/30 font-mono block">02</span>
            <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider font-mono">UNDERSTAND</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              AutoOps identifies what needs to be done.
            </p>
          </div>

          {/* Card 03 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl relative group hover:border-blue-500/50 transition-colors">
            <span className="text-2xl font-black text-blue-400/30 font-mono block">03</span>
            <h3 className="text-base font-bold text-blue-400 uppercase tracking-wider font-mono">ASSIGN</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              The system finds the right available person.
            </p>
          </div>

          {/* Card 04 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl relative group hover:border-emerald-500/50 transition-colors">
            <span className="text-2xl font-black text-emerald-400/30 font-mono block">04</span>
            <h3 className="text-base font-bold text-emerald-400 uppercase tracking-wider font-mono">RESOLVE</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              The assigned employee completes the task.
            </p>
          </div>
        </div>
      </div>

      {/* Real Example Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Demonstration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">See AutoOps in action</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-world example of how incoming complaints are converted into targeted field action
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left Side: USER REPORT */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">USER REPORT</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm leading-relaxed italic">
                "There is a large pothole near the school gate and vehicles are having difficulty passing."
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Location: Main Gate Entrance</span>
              <span className="text-slate-500">Submitted 2 mins ago</span>
            </div>
          </div>

          {/* Right Side: AUTOOPS DECISION */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-teal-950/30 border border-teal-500/40 rounded-2xl p-6 space-y-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>AUTOOPS DECISION</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  Task automatically assigned
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[10px]">Category</span>
                  <span className="font-bold text-white">Road</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[10px]">Priority</span>
                  <span className="font-bold text-amber-400">High</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[10px]">Department</span>
                  <span className="font-bold text-slate-200">Road Maintenance</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block uppercase text-[10px]">Assigned to</span>
                  <span className="font-bold text-emerald-400">Rahul Kumar</span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-mono font-bold text-teal-400 block text-[10px] uppercase">Reason:</span>
                <p className="leading-relaxed text-slate-200 text-xs">
                  "Rahul has the required road-repair skill, is available, and currently has the lowest workload."
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onReportIssue}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Try Reporting Your Own Issue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
