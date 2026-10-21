import React from 'react';
import { CheckCircle2, Database, GitBranch, Layers, ShieldAlert, DownloadCloud } from 'lucide-react';
import { Lead } from '../types';

interface KpiSummaryBannerProps {
  leads: Lead[];
  duplicateCount: number;
  onOpenDeduplication: () => void;
  onOpenBackup: () => void;
  onOpenSchema: () => void;
}

export const KpiSummaryBanner: React.FC<KpiSummaryBannerProps> = ({
  leads,
  duplicateCount,
  onOpenDeduplication,
  onOpenBackup,
  onOpenSchema,
}) => {
  const activeLeads = leads.filter((l) => l.status === 'active');
  const mergedLeads = leads.filter((l) => l.status === 'duplicate_merged');

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & Timeline Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide uppercase">
              <span>Sprint Milestone</span>
              <span aria-hidden="true">·</span>
              <span>21–27 October 2026</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">Days 1–7</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Week 1: Organize and Define
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Define what the first version of the CMS must do: consolidate student inquiries, lock lead stages,
              establish the course & college catalog, finalize relational schema, and clean duplicates with verified backups.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBackup}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>Take Backup</span>
            </button>
            <button
              onClick={onOpenSchema}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Inspect Schema</span>
            </button>
          </div>
        </div>

        {/* 3 Core Weekly KPIs Strip (Prompt Requirement) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* KPI 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Weekly KPI #1</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Target Met</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {activeLeads.length}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Active Student Inquiries
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              100% of known active inquiries gathered into master catalog
              {mergedLeads.length > 0 && ` (${mergedLeads.length} duplicates merged).`}
            </p>
            {duplicateCount > 0 ? (
              <button
                onClick={onOpenDeduplication}
                className="mt-3 text-xs font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Resolve {duplicateCount} flagged duplicate records &rarr;</span>
              </button>
            ) : (
              <div className="mt-3 text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deduplication check passed · Zero duplicate conflicts</span>
              </div>
            )}
          </div>

          {/* KPI 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Weekly KPI #2</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Locked v1.0.0</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                1
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Finalized Database Schema
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              7 normalized relational tables, UUID primary keys, foreign key constraints & performance indexes.
            </p>
            <button
              onClick={onOpenSchema}
              className="mt-3 text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View ER diagrams & PostgreSQL DDL &rarr;</span>
            </button>
          </div>

          {/* KPI 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Weekly KPI #3</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Production Ready</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                1
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Working Project Repository
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Live React + TypeScript engine, 7-stage pipeline transitions, RBAC permissions, and backup engine.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>Branch: <span className="font-mono text-slate-700 font-medium">main/week1-release</span></span>
            </div>
          </div>
        </div>

        {/* Days 1–7 Milestone Progress Tracker Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Sprint Cadence: 21–27 October (Days 1–7)</span>
            <span className="text-blue-600 font-normal">All 7 Deliverables Defined & Operational</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Day 1 · Oct 21</div>
              <div className="text-slate-600 text-[11px] truncate">Inquiries Master</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Day 2 · Oct 22</div>
              <div className="text-slate-600 text-[11px] truncate">7-Stage Pipeline</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Day 3 · Oct 23</div>
              <div className="text-slate-600 text-[11px] truncate">Courses & Colleges</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Day 4 · Oct 24</div>
              <div className="text-slate-600 text-[11px] truncate">Deduplication Engine</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Day 5 · Oct 25</div>
              <div className="text-slate-600 text-[11px] truncate">RBAC Login Roles</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Day 6 · Oct 26</div>
              <div className="text-slate-600 text-[11px] truncate">Backup & Disaster Recovery</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Day 7 · Oct 27</div>
              <div className="text-slate-600 text-[11px] truncate">Week 1 Sign-Off</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
