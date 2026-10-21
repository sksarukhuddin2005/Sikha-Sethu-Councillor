import React, { useState, useMemo } from 'react';
import { Lead, Course, College, StaffUser, DuplicateMatch } from '../types';
import { findDuplicates, mergeLeads } from '../utils/deduplication';
import {
  X,
  ShieldCheck,
  GitMerge,
  AlertTriangle,
  ArrowRight,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface DeduplicationModalProps {
  leads: Lead[];
  courses: Course[];
  colleges: College[];
  staffUsers: StaffUser[];
  activeUser: StaffUser;
  onClose: () => void;
  onUpdateLeads: (leads: Lead[]) => void;
}

export const DeduplicationModal: React.FC<DeduplicationModalProps> = ({
  leads,
  courses,
  colleges,
  staffUsers,
  activeUser,
  onClose,
  onUpdateLeads,
}) => {
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>(() => findDuplicates(leads));
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const collegeMap = useMemo(() => new Map(colleges.map((c) => [c.id, c])), [colleges]);

  // Merge pair action
  const handleMergePair = (primaryId: string, secondaryId: string, groupKey: string) => {
    const updated = mergeLeads(leads, primaryId, secondaryId, `${activeUser.name} (${activeUser.roleLabel.split(' ')[0]})`);
    onUpdateLeads(updated);
    setDuplicateMatches(findDuplicates(updated));
    setSuccessBanner(`Successfully merged secondary inquiry into primary record.`);
  };

  // Archive duplicate action
  const handleArchiveDuplicate = (duplicateId: string) => {
    const updated = leads.map((l) => (l.id === duplicateId ? { ...l, status: 'archived' as const } : l));
    onUpdateLeads(updated);
    setDuplicateMatches(findDuplicates(updated));
    setSuccessBanner(`Duplicate inquiry archived and removed from active roster.`);
  };

  // Auto-resolve all exact phone/email duplicates
  const handleAutoMergeAll = () => {
    let currentLeads = [...leads];
    let mergedCount = 0;

    duplicateMatches.forEach((group) => {
      if (group.leads.length >= 2) {
        // Sort: older lead or higher stage is primary
        const sorted = [...group.leads].sort((a, b) => {
          if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
          return b.notes.length - a.notes.length;
        });

        const primary = sorted[0];
        for (let i = 1; i < sorted.length; i++) {
          currentLeads = mergeLeads(
            currentLeads,
            primary.id,
            sorted[i].id,
            `Auto-Deduplication Engine (${activeUser.name})`
          );
          mergedCount++;
        }
      }
    });

    onUpdateLeads(currentLeads);
    setDuplicateMatches(findDuplicates(currentLeads));
    setSuccessBanner(`Batch deduplication completed: ${mergedCount} duplicate records consolidated.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Lead Deduplication & Cleaning Engine
              </h2>
              <p className="text-xs text-slate-500">
                Week 1 Objective: Identify and remove duplicate inquiries to ensure 100% active data hygiene
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

        {/* Action Bar */}
        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>
              {duplicateMatches.length === 0
                ? 'Master Inquiries list is 100% clean · Zero duplicate records detected.'
                : `${duplicateMatches.length} potential duplicate group(s) detected.`}
            </span>
          </div>

          {duplicateMatches.length > 0 && (
            <button
              onClick={handleAutoMergeAll}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto-Consolidate All Matches</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {successBanner && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {duplicateMatches.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                100% Clean Active Records Verified
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No phone number, email address, or name/course collisions detected across active leads. All student inquiries are verified unique.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Return to Master Inquiries
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {duplicateMatches.map((group, idx) => {
                const leadA = group.leads[0];
                const leadB = group.leads[1];
                const courseA = courseMap.get(leadA.targetCourseId);
                const courseB = courseMap.get(leadB.targetCourseId);
                const collegeA = collegeMap.get(leadA.targetCollegeId);
                const collegeB = collegeMap.get(leadB.targetCollegeId);

                return (
                  <div
                    key={group.id}
                    className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-3"
                  >
                    {/* Header of group */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          Conflict #{idx + 1}:
                        </span>
                        <span className="font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
                          {group.reason}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        Detected {group.detectedAt.slice(0, 10)}
                      </span>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Record A */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {leadA.inquiryNo} (Candidate A)
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            Stage: {leadA.leadStage}
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 text-sm">{leadA.name}</div>
                        <div className="text-slate-600 space-y-0.5 text-[11px]">
                          <div>Phone: <strong className="font-mono text-slate-800">{leadA.phone}</strong></div>
                          <div>Email: <span className="text-slate-800">{leadA.email}</span></div>
                          <div>City: {leadA.city}, {leadA.state}</div>
                          <div>Program: <strong className="text-slate-800">{courseA?.code}</strong> ({collegeA?.shortName})</div>
                          <div>Source: {leadA.source} · Created: {leadA.createdAt.slice(0, 10)}</div>
                          <div>Notes: {leadA.notes.length} logged</div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleMergePair(leadA.id, leadB.id, group.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                            title="Keep Record A as Primary and merge notes from B into A"
                          >
                            <GitMerge className="w-3 h-3" />
                            <span>Keep A as Master</span>
                          </button>
                        </div>
                      </div>

                      {/* Record B */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {leadB.inquiryNo} (Candidate B)
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            Stage: {leadB.leadStage}
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 text-sm">{leadB.name}</div>
                        <div className="text-slate-600 space-y-0.5 text-[11px]">
                          <div>Phone: <strong className="font-mono text-slate-800">{leadB.phone}</strong></div>
                          <div>Email: <span className="text-slate-800">{leadB.email}</span></div>
                          <div>City: {leadB.city}, {leadB.state}</div>
                          <div>Program: <strong className="text-slate-800">{courseB?.code}</strong> ({collegeB?.shortName})</div>
                          <div>Source: {leadB.source} · Created: {leadB.createdAt.slice(0, 10)}</div>
                          <div>Notes: {leadB.notes.length} logged</div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleMergePair(leadB.id, leadA.id, group.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                            title="Keep Record B as Primary and merge notes from A into B"
                          >
                            <GitMerge className="w-3 h-3" />
                            <span>Keep B as Master</span>
                          </button>

                          <button
                            onClick={() => handleArchiveDuplicate(leadB.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Discard / Archive Record B"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Deduplication Engine Rule: Match phone (last 10 digits), case-insensitive email, or exact student + target course.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done Cleaning
          </button>
        </div>
      </div>
    </div>
  );
};
