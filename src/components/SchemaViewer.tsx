import React, { useState } from 'react';
import { FINALIZED_DATABASE_TABLES, POSTGRESQL_DDL_SCRIPT } from '../data/schemaDefinition';
import { triggerDownload } from '../utils/storage';
import {
  Database,
  CheckCircle2,
  Lock,
  Copy,
  Download,
  Key,
  Link,
  Code2,
  Table as TableIcon,
} from 'lucide-react';

export const SchemaViewer: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState(FINALIZED_DATABASE_TABLES[0].tableName);
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'ddl' | 'relations'>('tables');
  const [copied, setCopied] = useState(false);

  const activeTable = FINALIZED_DATABASE_TABLES.find((t) => t.tableName === selectedTable) || FINALIZED_DATABASE_TABLES[0];

  const handleCopySql = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    triggerDownload(POSTGRESQL_DDL_SCRIPT, 'admitflow_schema_v1.0.0_finalized.sql', 'application/sql');
  };

  return (
    <div className="space-y-6">
      {/* Schema Finalization Status Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Weekly KPI #2 · Finalized & Architecture Locked</span>
            <span aria-hidden="true">·</span>
            <span>v1.0.0-GA</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>Relational Database Schema</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Production Locked</span>
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            7 normalized relational tables for PostgreSQL & Cloud SQL covering student inquiries, lead stage progression,
            academic program catalogs, role-based access control, and disaster recovery backup registries.
          </p>
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveSubTab('tables')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'tables' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Inspector</span>
            </button>
            <button
              onClick={() => setActiveSubTab('relations')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'relations' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>ER Diagram</span>
            </button>
            <button
              onClick={() => setActiveSubTab('ddl')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'ddl' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SQL DDL</span>
            </button>
          </div>

          <button
            onClick={handleDownloadSql}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download .SQL</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Relational Tables ({FINALIZED_DATABASE_TABLES.length})
            </div>
            {FINALIZED_DATABASE_TABLES.map((tbl) => {
              const isSelected = tbl.tableName === selectedTable;
              return (
                <button
                  key={tbl.tableName}
                  onClick={() => setSelectedTable(tbl.tableName)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <div className="font-mono text-[11px] text-slate-500">
                    {tbl.category}
                  </div>
                  <div className="font-bold text-slate-900">{tbl.tableName}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {tbl.columns.length} columns · PK: {tbl.primaryKey}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table Details */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">
                      {activeTable.tableName}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {activeTable.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {activeTable.description}
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Primary Key: <strong className="text-slate-800">{activeTable.primaryKey}</strong>
                </div>
              </div>

              {/* Columns Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Constraints</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {activeTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          {col.isPrimaryKey && (
                            <span title="Primary Key">
                              <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            </span>
                          )}
                          {col.isForeignKey && (
                            <span title="Foreign Key">
                              <Link className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            </span>
                          )}
                          <span>{col.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-blue-700 font-semibold">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {col.nullable ? 'NULLABLE' : 'NOT NULL'}
                          {col.defaultValue && ` (DEFAULT ${col.defaultValue})`}
                          {col.referencesTable && ` -> ${col.referencesTable}`}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Indexes */}
              {activeTable.indexes && activeTable.indexes.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                    Defined Performance & Deduplication Indexes:
                  </span>
                  <div className="space-y-1">
                    {activeTable.indexes.map((idx, i) => (
                      <div
                        key={i}
                        className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-slate-700"
                      >
                        {idx}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'relations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Entity Relationship Architecture</h3>
              <p className="text-xs text-slate-500">Foreign key mapping and normalization constraints</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              3rd Normal Form (3NF) Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Card 1: leads -> courses */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-blue-900">
                <span>leads</span>
                <span>&rarr; courses</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                <strong className="text-slate-800">target_course_id</strong> (FK) references <strong className="text-slate-800">courses.id</strong>
              </div>
              <p className="text-slate-500 text-[11px]">
                Enforces that every student inquiry belongs to an approved academic program (e.g., B.Tech CSE, MBA, Nursing).
              </p>
            </div>

            {/* Card 2: leads -> colleges */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-blue-900">
                <span>leads</span>
                <span>&rarr; colleges</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                <strong className="text-slate-800">target_college_id</strong> (FK) references <strong className="text-slate-800">colleges.id</strong>
              </div>
              <p className="text-slate-500 text-[11px]">
                Maps inquiry demand to constituent campus seat quotas and facilities.
              </p>
            </div>

            {/* Card 3: leads -> users_staff */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-blue-900">
                <span>leads</span>
                <span>&rarr; users_staff</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                <strong className="text-slate-800">assigned_counselor_id</strong> (FK) references <strong className="text-slate-800">users_staff.id</strong>
              </div>
              <p className="text-slate-500 text-[11px]">
                Tracks counselor accountability, follow-up queues, and conversion ratios.
              </p>
            </div>

            {/* Card 4: lead_stage_history -> leads */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                <span>lead_stage_history</span>
                <span>&rarr; leads</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                <strong className="text-slate-800">lead_id</strong> (FK) references <strong className="text-slate-800">leads.id</strong> (CASCADE)
              </div>
              <p className="text-slate-500 text-[11px]">
                Immutable audit ledger recording every stage advancement through the 7 defined states.
              </p>
            </div>

            {/* Card 5: lead_notes -> leads */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                <span>lead_notes</span>
                <span>&rarr; leads</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                <strong className="text-slate-800">lead_id</strong> (FK) references <strong className="text-slate-800">leads.id</strong> (CASCADE)
              </div>
              <p className="text-slate-500 text-[11px]">
                Captures counselor notes, parental queries, scholarship approvals, and campus visit logs.
              </p>
            </div>

            {/* Card 6: Deduplication & Backups */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                <span>backups_registry</span>
                <span>&rarr; governance</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                <strong className="text-slate-800">checksum</strong> (SHA-256) & <strong className="text-slate-800">file_size_bytes</strong>
              </div>
              <p className="text-slate-500 text-[11px]">
                Registers full-database disaster recovery snapshots and export integrity logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ddl' && (
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-slate-100 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="font-bold">PostgreSQL / Cloud SQL v1.0.0 DDL Script</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <button
                onClick={handleDownloadSql}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <pre className="overflow-x-auto max-h-[500px] leading-relaxed text-[11px] text-slate-300">
            {POSTGRESQL_DDL_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
};
