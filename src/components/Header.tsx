import React, { useState } from 'react';
import { Bot, FileText, LayoutDashboard, Users, CheckSquare, Building2, Zap, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  isLoggedIn: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
  onReportIssueClick?: () => void;
  selectedEmployeeName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  isLoggedIn,
  onLogout,
  onLoginClick,
  onReportIssueClick,
  selectedEmployeeName,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const scrollToHowItWorks = () => {
    setMobileMenuOpen(false);
    if (activeTab !== 'landing') {
      setActiveTab('landing');
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNavClick('landing')}>
            <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  AutoOps
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">From request to action, automatically.</p>
            </div>
          </div>

          {/* Desktop Dynamic Role Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {!isLoggedIn ? (
              /* PUBLIC / GUEST NAV */
              <>
                <button
                  onClick={() => handleNavClick('landing')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'landing'
                      ? 'bg-slate-800 text-teal-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Home
                </button>

                <button
                  onClick={scrollToHowItWorks}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  How It Works
                </button>

                <button
                  onClick={onLoginClick}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  Track Issue
                </button>
              </>
            ) : currentRole === 'CITIZEN' ? (
              /* CITIZEN NAV */
              <>
                <button
                  onClick={() => handleNavClick('user-dashboard')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'user-dashboard'
                      ? 'bg-slate-800 text-teal-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>My Issues</span>
                </button>
              </>
            ) : currentRole === 'EMPLOYEE' ? (
              /* EMPLOYEE NAV */
              <>
                <button
                  onClick={() => handleNavClick('my-tasks')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'my-tasks'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>My Tasks</span>
                </button>
              </>
            ) : (
              /* ADMIN NAV */
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-800 text-teal-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => handleNavClick('issues')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'issues'
                      ? 'bg-slate-800 text-teal-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Issues</span>
                </button>

                <button
                  onClick={() => handleNavClick('automation')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'automation'
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Automation Center</span>
                </button>

                <button
                  onClick={() => handleNavClick('team')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'team'
                      ? 'bg-slate-800 text-teal-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Employees</span>
                </button>

                <button
                  onClick={() => handleNavClick('departments')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'departments'
                      ? 'bg-slate-800 text-teal-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Departments</span>
                </button>

                <button
                  onClick={() => handleNavClick('demo')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'demo'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo Testing</span>
                </button>
              </>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onReportIssueClick) onReportIssueClick();
                else setActiveTab('submit');
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ml-2 ${
                activeTab === 'submit'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/20'
              }`}
            >
              <span>+ Report an Issue</span>
            </button>
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoggedIn ? (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-400" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-xs">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span className="font-semibold text-slate-200">
                    {currentRole === 'EMPLOYEE'
                      ? selectedEmployeeName
                      : currentRole === 'ADMIN'
                      ? 'Admin'
                      : 'Citizen'}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => {
                if (onReportIssueClick) onReportIssueClick();
                else setActiveTab('submit');
              }}
              className="px-3 py-1.5 rounded-lg bg-teal-500 text-white font-bold text-xs shadow-sm"
            >
              + Report
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {/* User Status Bar in Mobile Drawer */}
          {isLoggedIn && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-white">
                    {currentRole === 'EMPLOYEE' ? selectedEmployeeName : currentRole === 'ADMIN' ? 'Administrator' : 'Citizen User'}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">{currentRole}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNavClick('landing')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'landing'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={scrollToHowItWorks}
                  className="p-2.5 rounded-xl font-semibold text-left bg-slate-900 border border-slate-800 text-slate-300"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="col-span-2 p-2.5 rounded-xl font-semibold text-center bg-teal-600 text-white flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              </>
            ) : currentRole === 'CITIZEN' ? (
              <>
                <button
                  onClick={() => handleNavClick('landing')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'landing'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('user-dashboard')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'user-dashboard'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  My Reported Issues
                </button>
              </>
            ) : currentRole === 'EMPLOYEE' ? (
              <>
                <button
                  onClick={() => handleNavClick('my-tasks')}
                  className={`col-span-2 p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'my-tasks'
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  My Assigned Tasks
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'dashboard'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleNavClick('issues')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'issues'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  All Issues
                </button>
                <button
                  onClick={() => handleNavClick('automation')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'automation'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Automation Center
                </button>
                <button
                  onClick={() => handleNavClick('team')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'team'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Employees
                </button>
                <button
                  onClick={() => handleNavClick('departments')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'departments'
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => handleNavClick('demo')}
                  className={`p-2.5 rounded-xl font-semibold text-left border ${
                    activeTab === 'demo'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Demo Testing
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

