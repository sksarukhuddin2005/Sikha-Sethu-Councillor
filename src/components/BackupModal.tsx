import React, { useState } from 'react';
import { Lead, Course, College, StaffUser, BackupRecord } from '../types';
import { createBackupSnapshot, triggerDownload, exportLeadsToCsv } from '../utils/storage';
import {
  X,
  DownloadCloud,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

interface BackupModalProps {
  leads: Lead[];
  courses: Course[];
  colleges: College[];
  staffUsers: StaffUser[];
  activeUser: StaffUser;
  backups: BackupRecord[];
  onClose: () => void;
  onAddBackup: (backup: BackupRecord) => void;
  onRestoreData: (restoredLeads: Lead[], restoredCourses?: Course[], restoredColleges?: College[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  leads,
  courses,
  colleges,
  staffUsers,
  activeUser,
  backups,
  onClose,
  onAddBackup,
  onRestoreData,
}) => {
  const [backupNote, setBackupNote] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Take backup action
  const handleTakeBackup = () => {
    const { backupRecord, jsonPayload } = createBackupSnapshot(
      leads,
      courses,
      colleges,
      staffUsers,
      `${activeUser.name} (${activeUser.roleLabel.split(' ')[0]})`,
      backupNote.trim() || 'Scheduled Week 1 institutional snapshot.'
    );

    onAddBackup(backupRecord);
    triggerDownload(jsonPayload, backupRecord.filename, 'application/json');
    setSuccessMessage(`Backup archive created: ${backupRecord.filename} (${(backupRecord.fileSizeBytes / 1024).toFixed(1)} KB)`);
    setBackupNote('');
  };

  // Export CSV
  const handleExportCsv = () => {
    exportLeadsToCsv(leads, courses, colleges);
    setSuccessMessage(`Exported ${leads.length} student inquiry records to CSV.`);
  };

  // Restore from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.data || !Array.isArray(parsed.data.leads)) {
          throw new Error('Invalid AdmitFlow backup payload: missing data.leads array.');
        }

        onRestoreData(parsed.data.leads, parsed.data.courses, parsed.data.colleges);
        setSuccessMessage(`Successfully restored ${parsed.data.leads.length} inquiry records from backup file.`);
        setRestoreError(null);
      } catch (err: any) {
        setRestoreError(`Failed to parse backup archive: ${err.message || 'Unknown format'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Data Backup & Disaster Recovery Registry
              </h2>
              <p className="text-xs text-slate-500">
                Week 1 Objective: Back up existing student inquiry records and guarantee data survivability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {restoreError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Quick Actions Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Generate Full Backup */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900">Create Full Database Snapshot (JSON)</h3>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Archives all active and merged leads, academic programs, college quotas, counselor interaction notes, and stage audit histories.
              </p>

              <div>
                <input
                  type="text"
                  placeholder="Optional snapshot note (e.g., Pre-deduplication baseline)..."
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleTakeBackup}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Generate & Download Backup JSON</span>
              </button>
            </div>

            {/* Card 2: Export CSV & Restore */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Spreadsheet Export & Restore</h3>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Export clean tabular data for admissions committee presentations, or restore from an existing JSON backup archive.
              </p>

              <button
                onClick={handleExportCsv}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Master Inquiries (CSV)</span>
              </button>

              <div className="pt-2 border-t border-slate-200">
                <label className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-dashed border-slate-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Restore from JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Backup Audit Registry Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                Historical Backup Registry ({backups.length} snapshots)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                backups_registry Table
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Snapshot File</th>
                      <th className="py-2.5 px-3">Records</th>
                      <th className="py-2.5 px-3">Size & Integrity</th>
                      <th className="py-2.5 px-3">Triggered By & Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {backups.map((bkp) => (
                      <tr key={bkp.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{bkp.filename}</div>
                          <div className="font-sans text-[11px] text-slate-500 italic">{bkp.notes}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-bold tabular-nums">
                          {bkp.leadCount} leads · {bkp.courseCount} crs
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          <div>{(bkp.fileSizeBytes / 1024).toFixed(1)} KB</div>
                          <div className="text-slate-400 text-[10px] truncate max-w-[140px]">{bkp.checksum}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                          <div>{bkp.createdByUser}</div>
                          <div className="font-mono text-slate-400 text-[10px]">{bkp.timestamp.slice(0, 10)} {bkp.timestamp.slice(11, 16)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Current live state: {leads.filter((l) => l.status === 'active').length} active inquiries · {courses.length} courses · {colleges.length} colleges
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
