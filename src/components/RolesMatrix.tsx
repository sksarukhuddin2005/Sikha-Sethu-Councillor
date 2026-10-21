import React, { useState } from 'react';
import { StaffUser, RoleKey, Lead } from '../types';
import {
  ShieldCheck,
  UserCheck,
  Check,
  X,
  Phone,
  Mail,
  UserPlus,
  Plus,
} from 'lucide-react';

interface RolesMatrixProps {
  staffUsers: StaffUser[];
  activeUser: StaffUser;
  onSwitchUser: (userId: string) => void;
  leads: Lead[];
  onAddStaffUser: (user: StaffUser) => void;
}

interface PermissionRow {
  permission: string;
  category: string;
  super_admin: boolean;
  senior_counselor: boolean;
  frontdesk_telecaller: boolean;
  verification_officer: boolean;
  description: string;
}

const PERMISSIONS_MATRIX: PermissionRow[] = [
  {
    permission: 'Ingest New Student Inquiries',
    category: 'Lead Ingest',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: true,
    verification_officer: false,
    description: 'Capture student contact info, 10th/12th marks, and source attribution into New stage',
  },
  {
    permission: 'Telecall Outreach & Log Contacted',
    category: 'Pipeline',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: true,
    verification_officer: false,
    description: 'Execute initial contact outreach and advance lead from New to Contacted',
  },
  {
    permission: 'Eligibility Review & Advance to Qualified',
    category: 'Pipeline',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: false,
    verification_officer: false,
    description: 'Check minimum cutoffs (PCM 60%, NEET, CAT, PCB 50%) and move to Qualified',
  },
  {
    permission: 'Conduct In-Depth Counseling Session',
    category: 'Counseling',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: false,
    verification_officer: false,
    description: 'Host video/campus counseling sessions and advance lead to Counseling stage',
  },
  {
    permission: 'Application Form Submission & Token Collection',
    category: 'Pipeline',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: false,
    verification_officer: false,
    description: 'Issue application vouchers and advance lead to Application stage',
  },
  {
    permission: 'Document Audit & Certify Admission Verified',
    category: 'Registrar',
    super_admin: true,
    senior_counselor: false,
    frontdesk_telecaller: false,
    verification_officer: true,
    description: 'Inspect physical certificates, eligibility verification, and grant Admission Verified',
  },
  {
    permission: 'Final Admission Closure & Enrollment Code',
    category: 'Directorate',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: false,
    verification_officer: false,
    description: 'Confirm fee clearance, assign enrollment ID, and mark stage as Closed',
  },
  {
    permission: 'Execute Lead Deduplication & Merge',
    category: 'Data Hygiene',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: true,
    verification_officer: false,
    description: 'Scan phone/email collisions and consolidate secondary inquiries into master record',
  },
  {
    permission: 'Modify Course & College Master Catalog',
    category: 'Master Data',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: false,
    verification_officer: false,
    description: 'Create new programs (e.g. B.Tech AI & Data Science) and update seat intake quotas',
  },
  {
    permission: 'Trigger Full JSON Database Backup',
    category: 'Governance',
    super_admin: true,
    senior_counselor: true,
    frontdesk_telecaller: false,
    verification_officer: false,
    description: 'Download cryptographic state archive with all tables and lead notes',
  },
  {
    permission: 'Schema Lock & Production DDL Governance',
    category: 'Governance',
    super_admin: true,
    senior_counselor: false,
    frontdesk_telecaller: false,
    verification_officer: false,
    description: 'Manage relational schema definitions and table constraints',
  },
];

export const RolesMatrix: React.FC<RolesMatrixProps> = ({
  staffUsers,
  activeUser,
  onSwitchUser,
  leads,
  onAddStaffUser,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleKey>('senior_counselor');
  const [department, setDepartment] = useState('STEM & AI Admissions Cell');

  // Count assigned active leads per staff user
  const assignedCounts = staffUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.id] = leads.filter((l) => l.status === 'active' && l.assignedCounselorId === u.id).length;
    return acc;
  }, {});

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const roleLabels: Record<RoleKey, string> = {
      super_admin: 'Super Admin / Admissions Director',
      senior_counselor: 'Senior Admissions Counselor',
      frontdesk_telecaller: 'Frontdesk & Telecaller (Lead Ingestor)',
      verification_officer: 'Verification Officer / Registrar',
    };

    const newStaff: StaffUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 00000',
      role,
      roleLabel: roleLabels[role],
      department: department.trim() || 'Admissions Counseling Cell',
    };

    onAddStaffUser(newStaff);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide uppercase">
            <span>Institutional Security & Access Governance</span>
            <span aria-hidden="true">·</span>
            <span>Finalized Login Roles</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Staff Counselors & RBAC Roles Matrix
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Role definitions and stage authorization guardrails for Admissions Directors, Senior Counselors, Telecallers, and Verification Registrars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Counselor / Staff</span>
          </button>

          {/* Current Active User Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-xs">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Active Session:</div>
              <div className="font-bold text-slate-900">{activeUser.name.split(' ')[0]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff User Switcher Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700">
            Active Admissions Staff & Counselors ({staffUsers.length})
          </span>
          <span className="text-slate-500">
            Click any profile to test permissions as that staff member
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {staffUsers.map((user) => {
            const isActive = user.id === activeUser.id;
            const assignedCount = assignedCounts[user.id] || 0;

            return (
              <div
                key={user.id}
                onClick={() => onSwitchUser(user.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-mono text-[10px] text-slate-400">
                      {user.id}
                    </span>
                    {isActive && (
                      <span className="font-bold text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Active Session
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-slate-900">
                    {user.name}
                  </h3>
                  <div className="text-xs font-semibold text-blue-700 mt-0.5">
                    {user.roleLabel}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {user.department}
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Assigned Queue:
                  </span>
                  <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
                    {assignedCount} Leads
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Role-Based Access Control (RBAC) Entitlements
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Security Policy v1.0.0
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Permission & Operation</th>
                <th className="py-3 px-3 text-center">Super Admin</th>
                <th className="py-3 px-3 text-center">Senior Counselor</th>
                <th className="py-3 px-3 text-center">Telecaller Desk</th>
                <th className="py-3 px-3 text-center">Verification Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{row.permission}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{row.description}</div>
                  </td>

                  {/* Super Admin */}
                  <td className="py-3 px-3 text-center">
                    {row.super_admin ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Senior Counselor */}
                  <td className="py-3 px-3 text-center">
                    {row.senior_counselor ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Telecaller */}
                  <td className="py-3 px-3 text-center">
                    {row.frontdesk_telecaller ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Verification Officer */}
                  <td className="py-3 px-3 text-center">
                    {row.verification_officer ? (
                      <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Click any staff card above to switch your active session role and test permission enforcement in real time.</span>
          <span className="text-blue-700 font-semibold">{staffUsers.length} Staff Configured</span>
        </div>
      </div>

      {/* Add Counselor / Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add New Counselor / Staff</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavita Singhania"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Official Email <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. k.singhania@admitflow.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98334 12098"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleKey)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="senior_counselor">Senior Admissions Counselor</option>
                  <option value="frontdesk_telecaller">Frontdesk & Telecaller (Lead Ingestor)</option>
                  <option value="verification_officer">Verification Officer / Registrar</option>
                  <option value="super_admin">Super Admin / Admissions Director</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Department / Cell</label>
                <input
                  type="text"
                  placeholder="e.g. Computing & AI Admissions Cell, Healthcare Cell"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Save Counselor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
