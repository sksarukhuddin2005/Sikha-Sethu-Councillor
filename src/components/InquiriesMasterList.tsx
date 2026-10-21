import React, { useState, useMemo } from 'react';
import { Lead, Course, College, StaffUser, LeadStage } from '../types';
import {
  Search,
  Filter,
  ArrowRight,
  User,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  LayoutGrid,
  List,
  CheckCircle,
  Eye,
} from 'lucide-react';

interface InquiriesMasterListProps {
  leads: Lead[];
  courses: Course[];
  colleges: College[];
  staffUsers: StaffUser[];
  activeUser: StaffUser;
  onSelectLead: (lead: Lead) => void;
  onAdvanceStage: (leadId: string, targetStage: LeadStage) => void;
  onOpenAddLead: () => void;
  onExportCsv: () => void;
  onOpenDeduplication: () => void;
  viewMode: 'table' | 'pipeline';
  setViewMode: (mode: 'table' | 'pipeline') => void;
}

const STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Qualified',
  'Counseling',
  'Application',
  'Admission Verified',
  'Closed',
];

export const InquiriesMasterList: React.FC<InquiriesMasterListProps> = ({
  leads,
  courses,
  colleges,
  staffUsers,
  activeUser,
  onSelectLead,
  onAdvanceStage,
  onOpenAddLead,
  onExportCsv,
  onOpenDeduplication,
  viewMode,
  setViewMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [showMerged, setShowMerged] = useState(false);

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const collegeMap = useMemo(() => new Map(colleges.map((c) => [c.id, c])), [colleges]);
  const staffMap = useMemo(() => new Map(staffUsers.map((s) => [s.id, s])), [staffUsers]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Merged filter
      if (!showMerged && lead.status === 'duplicate_merged') return false;
      if (showMerged && lead.status !== 'duplicate_merged') return false;

      // Stage filter
      if (selectedStage !== 'all' && lead.leadStage !== selectedStage) return false;

      // Course filter
      if (selectedCourse !== 'all' && lead.targetCourseId !== selectedCourse) return false;

      // College filter
      if (selectedCollege !== 'all' && lead.targetCollegeId !== selectedCollege) return false;

      // Search query (name, email, phone, inquiryNo, city)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(query);
        const matchesEmail = lead.email.toLowerCase().includes(query);
        const matchesPhone = lead.phone.includes(query);
        const matchesInquiry = lead.inquiryNo.toLowerCase().includes(query);
        const matchesCity = lead.city.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesInquiry && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [leads, showMerged, selectedStage, selectedCourse, selectedCollege, searchQuery]);

  // Counts by stage for pipeline summary
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STAGES.forEach((s) => {
      counts[s] = leads.filter((l) => l.status === 'active' && l.leadStage === s).length;
    });
    return counts;
  }, [leads]);

  const getNextStage = (current: LeadStage): LeadStage | null => {
    const idx = STAGES.indexOf(current);
    if (idx >= 0 && idx < STAGES.length - 1) {
      return STAGES[idx + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 7 Lead Stages Progression Stepper Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Defined Lead Stages Workflow
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              (New &rarr; Contacted &rarr; Qualified &rarr; Counseling &rarr; Application &rarr; Admission Verified &rarr; Closed)
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-700">
            Total Active: <span className="font-mono tabular-nums">{leads.filter((l) => l.status === 'active').length}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STAGES.map((stg, i) => {
            const isSelected = selectedStage === stg;
            const count = stageCounts[stg] || 0;
            return (
              <button
                key={stg}
                onClick={() => setSelectedStage(isSelected ? 'all' : stg)}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Step {i + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-mono tabular-nums">
                    {count}
                  </span>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-900 truncate">
                  {stg}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Strip & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student, inquiry no, phone, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Stages ({leads.filter((l) => l.status === 'active').length})</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s} ({stageCounts[s] || 0})
              </option>
            ))}
          </select>

          {/* Program / Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Programs ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} · {c.name.split(' (')[0]}
              </option>
            ))}
          </select>

          {/* College Filter */}
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Campuses</option>
            {colleges.map((col) => (
              <option key={col.id} value={col.id}>
                {col.shortName}
              </option>
            ))}
          </select>

          {/* Toggle Merged Leads */}
          <button
            onClick={() => setShowMerged(!showMerged)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              showMerged
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:text-slate-900'
            }`}
          >
            {showMerged ? 'Showing Merged Duplicates' : 'Hide Merged Duplicates'}
          </button>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`p-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'pipeline' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Pipeline View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
          </div>

          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            title="Export master inquiries to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddLead}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            + Ingest Inquiry
          </button>
        </div>
      </div>

      {/* Main View: Table vs Pipeline Board */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Inquiry / Candidate</th>
                  <th className="py-3 px-4">Target Program & College</th>
                  <th className="py-3 px-4">Academic Background</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Source & Counselor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Filter className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-slate-700">No student inquiries found</p>
                        <p className="text-xs text-slate-500">
                          Try adjusting search terms or stage filters, or ingest a fresh inquiry.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const course = courseMap.get(lead.targetCourseId);
                    const college = collegeMap.get(lead.targetCollegeId);
                    const counselor = staffMap.get(lead.assignedCounselorId);
                    const nextStage = getNextStage(lead.leadStage);

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          lead.status === 'duplicate_merged' ? 'opacity-60 bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Candidate Info */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onSelectLead(lead)}>
                                {lead.name}
                              </span>
                              {lead.priority === 'High' && (
                                <span className="text-[10px] font-bold text-rose-700">
                                  [High]
                                </span>
                              )}
                              {lead.status === 'duplicate_merged' && (
                                <span className="text-[10px] font-medium text-amber-700">
                                  (Merged)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                              <span>{lead.inquiryNo}</span>
                              <span aria-hidden="true">·</span>
                              <span>{lead.phone}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {lead.city}, {lead.state}
                            </div>
                          </div>
                        </td>

                        {/* Program & College */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                              {course ? course.name : lead.targetCourseId}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5">
                              {college ? college.shortName : lead.targetCollegeId} ({course?.stream})
                            </span>
                            {course && (
                              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                                ₹{course.annualFeeInr.toLocaleString('en-IN')}/yr
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Academic Record */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col text-[11px] text-slate-600">
                            <div>
                              <span>12th: </span>
                              <span className="font-semibold text-slate-800 font-mono tabular-nums">
                                {lead.academicRecord.twelfthMarksPercentage}%
                              </span>
                              <span> ({lead.academicRecord.twelfthStream})</span>
                            </div>
                            {lead.academicRecord.entranceExamName && (
                              <div className="text-slate-500">
                                <span>{lead.academicRecord.entranceExamName}: </span>
                                <span className="font-medium text-slate-700 font-mono tabular-nums">
                                  {lead.academicRecord.entranceScoreOrPercentile}
                                </span>
                              </div>
                            )}
                            {lead.academicRecord.graduationPercentage && (
                              <div className="text-slate-500">
                                <span>Grad: {lead.academicRecord.graduationPercentage}%</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Pipeline Stage */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {lead.leadStage}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {lead.notes.length} note{lead.notes.length === 1 ? '' : 's'} recorded
                            </span>
                            {lead.admissionFeePaid && lead.admissionFeePaid > 0 ? (
                              <span className="text-[11px] font-semibold text-emerald-700 font-mono tabular-nums">
                                ₹{lead.admissionFeePaid.toLocaleString('en-IN')} paid
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Source & Assigned Counselor */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col text-[11px]">
                            <span className="text-slate-700 font-medium">
                              {lead.source}
                            </span>
                            <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{counselor ? counselor.name.split(' ')[0] : 'Unassigned'}</span>
                            </span>
                            {lead.nextFollowUpDate && (
                              <span className="text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{lead.nextFollowUpDate.slice(0, 10)}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectLead(lead)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="View Lead Profile & Counseling Notes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {nextStage && lead.status === 'active' && (
                              <button
                                onClick={() => onAdvanceStage(lead.id, nextStage)}
                                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title={`Advance stage to ${nextStage}`}
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {lead.leadStage === 'Admission Verified' && lead.status === 'active' && (
                              <button
                                onClick={() => onAdvanceStage(lead.id, 'Closed')}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Finalize Enrollment & Close"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Enroll</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <span className="font-bold text-slate-700 font-mono tabular-nums">{filteredLeads.length}</span> of{' '}
              <span className="font-bold text-slate-700 font-mono tabular-nums">{leads.length}</span> recorded inquiries
            </span>
            <div className="flex items-center gap-3">
              <span>Week 1 Master Inquiries List</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={onOpenDeduplication}
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Scan for Duplicates
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Kanban Pipeline Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.leadStage === stage && l.status === 'active');
            const nextStage = getNextStage(stage);

            return (
              <div
                key={stage}
                className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex flex-col min-w-[220px]"
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                  <div className="font-bold text-xs text-slate-900 truncate" title={stage}>
                    {stage}
                  </div>
                  <span className="text-xs font-bold text-slate-600 font-mono tabular-nums bg-white px-2 py-0.5 rounded border border-slate-200">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      No inquiries in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const course = courseMap.get(lead.targetCourseId);
                      const college = collegeMap.get(lead.targetCollegeId);
                      const counselor = staffMap.get(lead.assignedCounselorId);

                      return (
                        <div
                          key={lead.id}
                          className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs hover:border-blue-400 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span
                                onClick={() => onSelectLead(lead)}
                                className="font-bold text-xs text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1"
                              >
                                {lead.name}
                              </span>
                              {lead.priority === 'High' && (
                                <span className="text-[10px] font-bold text-rose-700 shrink-0">
                                  !
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                              {lead.inquiryNo} · {lead.city}
                            </div>

                            <div className="mt-2 text-xs font-medium text-slate-700 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">{course?.code || lead.targetCourseId}</span>
                            </div>

                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {college?.shortName}
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                              <span>12th: <strong className="text-slate-800 font-mono">{lead.academicRecord.twelfthMarksPercentage}%</strong></span>
                              <span>{counselor?.name.split(' ')[0]}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <button
                              onClick={() => onSelectLead(lead)}
                              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              Details
                            </button>

                            {nextStage && (
                              <button
                                onClick={() => onAdvanceStage(lead.id, nextStage)}
                                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>&rarr; {nextStage.split(' ')[0]}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
