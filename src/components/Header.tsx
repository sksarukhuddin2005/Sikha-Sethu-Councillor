import React from 'react';
import { StaffUser } from '../types';
import { UserCheck, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'inquiries' | 'pipeline' | 'catalog' | 'schema' | 'roles';
  setActiveTab: (tab: 'inquiries' | 'pipeline' | 'catalog' | 'schema' | 'roles') => void;
  onOpenAddLead: () => void;
  staffUsers: StaffUser[];
  activeUser: StaffUser;
  onSwitchUser: (userId: string) => void;
  duplicateCount: number;
  onOpenDeduplication: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddLead,
  staffUsers,
  activeUser,
  onSwitchUser,
  duplicateCount,
  onOpenDeduplication,
  onOpenBackup,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Universal Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('inquiries')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors whitespace-nowrap">
                AdmitFlow<span className="text-blue-600">CMS</span>
              </span>
            </button>
          </div>

          {/* Zone 2: 4–5 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'inquiries' ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : ''
              }`}
            >
              Master Inquiries
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'pipeline' ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : ''
              }`}
            >
              Stage Pipeline
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'catalog' ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : ''
              }`}
            >
              Programs & Colleges
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'schema' ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : ''
              }`}
            >
              Database Schema
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'roles' ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : ''
              }`}
            >
              Role Matrix
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddLead}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + Record Inquiry
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Workspace Utility Strip */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800">Week 1 Milestone:</span>
            <span>21–27 October · Days 1–7</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-600">First Version Architecture & Master List</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Deduplication Quick Trigger */}
            {duplicateCount > 0 ? (
              <button
                onClick={onOpenDeduplication}
                className="text-amber-800 hover:text-amber-900 font-medium underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>{duplicateCount} Duplicates Flagged</span>
                <span className="text-slate-400">·</span>
                <span>Clean & Merge</span>
              </button>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Duplicates</span>
              </span>
            )}

            <span aria-hidden="true" className="text-slate-300">·</span>

            {/* Backups trigger */}
            <button
              onClick={onOpenBackup}
              className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
            >
              Backup & Export
            </button>

            <span aria-hidden="true" className="text-slate-300">·</span>

            {/* Active User / Role Switcher */}
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 hidden sm:inline">Role:</span>
              <select
                value={activeUser.id}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 rounded px-2 py-0.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                title="Switch active session role to test RBAC permissions"
              >
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleLabel.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
