import React, { useState } from 'react';
import { Lead, Course, College, StaffUser, LeadStage } from '../types';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead;
  courses: Course[];
  colleges: College[];
  staffUsers: StaffUser[];
  activeUser: StaffUser;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onAdvanceStage: (leadId: string, stage: LeadStage, note?: string) => void;
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

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  courses,
  colleges,
  staffUsers,
  activeUser,
  onClose,
  onUpdateLead,
  onAdvanceStage,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [targetNextStage, setTargetNextStage] = useState<LeadStage>(lead.leadStage);
  const [transitionNote, setTransitionNote] = useState('');
  const [feeInput, setFeeInput] = useState<string>(lead.admissionFeePaid?.toString() || '');
  const [followUpDateInput, setFollowUpDateInput] = useState<string>(
    lead.nextFollowUpDate ? lead.nextFollowUpDate.slice(0, 16) : ''
  );

  const course = courses.find((c) => c.id === lead.targetCourseId);
  const college = colleges.find((c) => c.id === lead.targetCollegeId);
  const counselor = staffUsers.find((s) => s.id === lead.assignedCounselorId);

  // Handle adding a new counseling note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: `n-${Date.now()}`,
      text: newNoteText.trim(),
      author: activeUser.name,
      role: activeUser.roleLabel,
      timestamp: new Date().toISOString(),
      stageAtNote: lead.leadStage,
    };

    const updatedLead: Lead = {
      ...lead,
      notes: [newNote, ...lead.notes],
      updatedAt: new Date().toISOString(),
    };

    onUpdateLead(updatedLead);
    setNewNoteText('');
  };

  // Handle stage transition
  const handleExecuteTransition = () => {
    if (targetNextStage === lead.leadStage) return;

    // Check permissions
    if (targetNextStage === 'Admission Verified' && !['verification_officer', 'super_admin'].includes(activeUser.role)) {
      alert(`Role Restriction: Only Central Verification Officer or Super Admin can certify 'Admission Verified'. Your current role is: ${activeUser.roleLabel}`);
      return;
    }

    if (targetNextStage === 'Closed' && !['super_admin', 'senior_counselor'].includes(activeUser.role)) {
      alert(`Role Restriction: Only Admissions Director or Senior Counselor can finalize enrollment closure.`);
      return;
    }

    onAdvanceStage(lead.id, targetNextStage, transitionNote.trim() || undefined);
    setTransitionNote('');
  };

  // Save quick updates (fee, follow up date)
  const handleSaveQuickDetails = () => {
    const updated: Lead = {
      ...lead,
      admissionFeePaid: feeInput ? parseFloat(feeInput) : undefined,
      nextFollowUpDate: followUpDateInput ? new Date(followUpDateInput).toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    onUpdateLead(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {lead.inquiryNo}
              </span>
              <span className="text-xs text-slate-500">Inquiry Ingested {lead.createdAt.slice(0, 10)}</span>
              {lead.priority === 'High' && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  High Priority Lead
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{lead.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 7-Stage Progression Breadcrumb */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">
              Pipeline Stage Progression
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 text-[11px]">
              {STAGES.map((stg, i) => {
                const isCurrent = lead.leadStage === stg;
                const isPassed = STAGES.indexOf(lead.leadStage) > i;

                return (
                  <div
                    key={stg}
                    className={`p-1.5 rounded text-center font-medium border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">0{i + 1}</div>
                    <div className="truncate font-semibold">{stg}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column Split: Candidate Profile & Academic Scores vs Transition & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Candidate Details & Academic Data */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Student Contact & Location
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Primary Mobile: <strong className="font-mono text-slate-900">{lead.phone}</strong></span>
                  </div>
                  {lead.parentPhone && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Parent Contact: <strong className="font-mono text-slate-900">{lead.parentPhone}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">Email: <strong className="text-slate-900">{lead.email}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Residence: <strong className="text-slate-900">{lead.city}, {lead.state}</strong></span>
                  </div>
                </div>
              </div>

              {/* Target Academic Program & College */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Degree & Institution
                </h3>
                <div className="text-xs space-y-1.5">
                  <div className="font-bold text-slate-900 text-sm">
                    {course ? course.name : lead.targetCourseId}
                  </div>
                  <div className="text-slate-600">
                    Campus: <strong className="text-slate-800">{college ? college.name : lead.targetCollegeId}</strong>
                  </div>
                  <div className="text-slate-600">
                    Stream: <span className="font-medium text-slate-800">{course?.stream}</span> · Level: {course?.level}
                  </div>
                  {course && (
                    <div className="text-slate-600">
                      Annual Tuition Fee: <strong className="font-mono text-slate-900">₹{course.annualFeeInr.toLocaleString('en-IN')}</strong> · Duration: {course.durationYears} Years
                    </div>
                  )}
                  {course && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-500 mt-2">
                      <strong>Eligibility:</strong> {course.eligibilityCriteria}
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Record */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verified Academic Credentials
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">10th Standard:</span>
                    <strong className="text-sm font-mono text-slate-900">{lead.academicRecord.tenthMarksPercentage}%</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">12th Standard:</span>
                    <strong className="text-sm font-mono text-slate-900">{lead.academicRecord.twelfthMarksPercentage}%</strong>
                    <span className="text-[10px] text-slate-500 block">Stream: {lead.academicRecord.twelfthStream}</span>
                  </div>
                </div>

                {lead.academicRecord.entranceExamName && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">National / State Entrance Exam:</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-bold text-slate-800">{lead.academicRecord.entranceExamName}</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {lead.academicRecord.entranceScoreOrPercentile}
                      </span>
                    </div>
                  </div>
                )}

                {lead.academicRecord.graduationPercentage && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px]">Undergraduate Degree (for MBA):</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-bold text-slate-800">{lead.academicRecord.graduationDegree || 'Bachelor Degree'}</span>
                      <span className="font-mono font-bold text-slate-900">{lead.academicRecord.graduationPercentage}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-up & Payment Quick Update */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Schedules & Token Collection
                  </h3>
                  <button
                    onClick={handleSaveQuickDetails}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Next Follow-Up</label>
                    <input
                      type="datetime-local"
                      value={followUpDateInput}
                      onChange={(e) => setFollowUpDateInput(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Fee Collected (INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Stage Transition Engine & Counseling Notes Feed */}
            <div className="space-y-4">
              {/* Advance Stage Control */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>Advance Pipeline Stage</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Acting as: <strong className="text-slate-800">{activeUser.roleLabel.split(' ')[0]}</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-slate-600 font-medium">
                    Select Target Next Stage
                  </label>
                  <select
                    value={targetNextStage}
                    onChange={(e) => setTargetNextStage(e.target.value as LeadStage)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg} {stg === lead.leadStage ? '(Current Stage)' : ''}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Mandatory transition audit remark or condition..."
                    value={transitionNote}
                    onChange={(e) => setTransitionNote(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      Advances lead along defined SLA stages
                    </span>
                    <button
                      onClick={handleExecuteTransition}
                      disabled={targetNextStage === lead.leadStage}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        targetNextStage === lead.leadStage
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                      }`}
                    >
                      Update Stage
                    </button>
                  </div>
                </div>
              </div>

              {/* Add New Note */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Log Counseling Remark / Telecall Note
                </h3>
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter telecall summary, student inquiries, hostel queries, or campus visit details..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Logged by {activeUser.name}
                    </span>
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Note</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Counseling Notes Feed */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Interaction History ({lead.notes.length})
                </h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {lead.notes.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-4 text-center">
                      No interaction notes recorded yet.
                    </div>
                  ) : (
                    lead.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{note.author}</span>
                          <span className="text-slate-400 font-mono">
                            {note.timestamp.slice(0, 10)} {note.timestamp.slice(11, 16)}
                          </span>
                        </div>
                        <div className="text-[10px] text-blue-700 font-medium">
                          Stage: {note.stageAtNote}
                        </div>
                        <p className="text-slate-700 leading-relaxed text-xs pt-1">
                          {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Stage Audit History */}
              <div className="pt-2 border-t border-slate-200">
                <details className="text-xs">
                  <summary className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900">
                    View Stage Transition Audit Ledger ({lead.stageHistory.length} events)
                  </summary>
                  <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-slate-200">
                    {lead.stageHistory.map((sh) => (
                      <div key={sh.id} className="text-[11px] text-slate-600">
                        <div className="font-mono text-[10px] text-slate-400">
                          {sh.timestamp.slice(0, 10)} {sh.timestamp.slice(11, 16)}
                        </div>
                        <div>
                          <strong className="text-slate-900">{sh.fromStage}</strong> &rarr;{' '}
                          <strong className="text-blue-700">{sh.toStage}</strong> by {sh.changedBy}
                        </div>
                        {sh.note && <div className="text-slate-500 italic mt-0.5">&ldquo;{sh.note}&rdquo;</div>}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Lead ID: {lead.id} · Source: {lead.source}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};
