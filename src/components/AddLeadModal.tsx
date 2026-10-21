import React, { useState, useMemo } from 'react';
import { Lead, Course, College, StaffUser, LeadPriority, LeadSource } from '../types';
import { normalizePhone } from '../utils/deduplication';
import { X, AlertTriangle, ShieldCheck, UserPlus } from 'lucide-react';

interface AddLeadModalProps {
  courses: Course[];
  colleges: College[];
  staffUsers: StaffUser[];
  activeUser: StaffUser;
  existingLeads: Lead[];
  onClose: () => void;
  onSaveLead: (newLead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  courses,
  colleges,
  staffUsers,
  activeUser,
  existingLeads,
  onClose,
  onSaveLead,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [targetCourseId, setTargetCourseId] = useState(courses[0]?.id || 'crs-btech-cse');
  const [targetCollegeId, setTargetCollegeId] = useState(colleges[0]?.id || 'clg-apex-tech');
  const [priority, setPriority] = useState<LeadPriority>('Normal');
  const [source, setSource] = useState<LeadSource>('Website Inbound');
  const [assignedCounselorId, setAssignedCounselorId] = useState(staffUsers[1]?.id || staffUsers[0]?.id || '');
  const [tenthMarks, setTenthMarks] = useState<number>(85);
  const [twelfthMarks, setTwelfthMarks] = useState<number>(80);
  const [twelfthStream, setTwelfthStream] = useState<'PCM' | 'PCB' | 'Commerce' | 'Arts'>('PCM');
  const [entranceExam, setEntranceExam] = useState('');
  const [entranceScore, setEntranceScore] = useState('');
  const [initialNote, setInitialNote] = useState('');

  // Live duplicate warning check
  const duplicateWarning = useMemo(() => {
    if (!phone && !email) return null;
    const normPhone = normalizePhone(phone);
    const cleanEmail = email.trim().toLowerCase();

    for (const l of existingLeads) {
      if (l.status !== 'active') continue;
      if (normPhone && normalizePhone(l.phone) === normPhone) {
        return {
          type: 'phone',
          message: `Phone number matches existing inquiry: ${l.name} (${l.inquiryNo} · ${l.leadStage})`,
        };
      }
      if (cleanEmail && l.email.trim().toLowerCase() === cleanEmail) {
        return {
          type: 'email',
          message: `Email address matches existing inquiry: ${l.name} (${l.inquiryNo} · ${l.leadStage})`,
        };
      }
    }
    return null;
  }, [phone, email, existingLeads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please fill in candidate name, phone, and email.');
      return;
    }

    const timestamp = new Date().toISOString();
    const sequenceNum = 100 + existingLeads.length + 1;
    const inquiryNo = `ADM-2026-${sequenceNum}`;
    const newId = `lead-${Date.now()}`;

    const newLead: Lead = {
      id: newId,
      inquiryNo,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      parentPhone: parentPhone.trim() || undefined,
      city: city.trim() || 'Unspecified',
      state,
      targetCourseId,
      targetCollegeId,
      academicRecord: {
        tenthMarksPercentage: Number(tenthMarks) || 0,
        twelfthMarksPercentage: Number(twelfthMarks) || 0,
        twelfthStream,
        entranceExamName: entranceExam.trim() || undefined,
        entranceScoreOrPercentile: entranceScore.trim() || undefined,
      },
      leadStage: 'New',
      priority,
      assignedCounselorId,
      source,
      notes: initialNote.trim()
        ? [
            {
              id: `n-${Date.now()}`,
              text: initialNote.trim(),
              author: activeUser.name,
              role: activeUser.roleLabel,
              timestamp,
              stageAtNote: 'New',
            },
          ]
        : [],
      stageHistory: [
        {
          id: `sh-${Date.now()}`,
          fromStage: 'Initial Ingest',
          toStage: 'New',
          timestamp,
          changedBy: `${activeUser.name} (${activeUser.roleLabel.split(' ')[0]})`,
          note: `Ingested via ${source}. Initial record created.`,
        },
      ],
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    onSaveLead(newLead);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ingest New Student Inquiry</h2>
              <p className="text-xs text-slate-500">Record fresh applicant details into Week 1 master inquiry list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Duplicate Detection Warning Banner */}
          {duplicateWarning && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Duplicate Alert Detected!</strong>
                <span>{duplicateWarning.message}</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  You can proceed to ingest, and the CMS Deduplication Engine will link or merge records later.
                </p>
              </div>
            </div>
          )}

          {/* Section: Candidate Contact */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              1. Candidate Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Full Student Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Dev Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Student Mobile (Primary) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98450 11223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.roy@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Parent / Guardian Mobile
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98450 11200"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Pune, Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Kerala">Kerala</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Other">Other State</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Academic Programs & Campus */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              2. Target Degree & Campus
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Target Academic Program <span className="text-rose-600">*</span>
                </label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Target Campus / College <span className="text-rose-600">*</span>
                </label>
                <select
                  value={targetCollegeId}
                  onChange={(e) => setTargetCollegeId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-medium"
                >
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.shortName} · {col.city} ({col.accreditation})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Academic Background */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              3. Academic Scores & Entrance Tests
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">10th %</label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={tenthMarks}
                  onChange={(e) => setTenthMarks(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">12th %</label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={twelfthMarks}
                  onChange={(e) => setTwelfthMarks(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">12th Stream</label>
                <select
                  value={twelfthStream}
                  onChange={(e) => setTwelfthStream(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="PCM">PCM (Engineering)</option>
                  <option value="PCB">PCB (Pharmacy/Nursing)</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts / Humanities</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Entrance Exam (JEE / NEET / CAT / State CET)
                </label>
                <input
                  type="text"
                  placeholder="e.g. JEE Main 2026, NEET 2026, CAT 2025"
                  value={entranceExam}
                  onChange={(e) => setEntranceExam(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Score / Rank / Percentile
                </label>
                <input
                  type="text"
                  placeholder="e.g. 94.2 Percentile, 480 Marks"
                  value={entranceScore}
                  onChange={(e) => setEntranceScore(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Source & Assignment */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              4. Ingest Source & Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Inquiry Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Website Inbound">Website Inbound</option>
                  <option value="Campus Walk-in">Campus Walk-in</option>
                  <option value="Education Fair">Education Fair</option>
                  <option value="Shiksha Portal">Shiksha Portal</option>
                  <option value="CollegeDunia">CollegeDunia</option>
                  <option value="Meta & Google Ads">Meta & Google Ads</option>
                  <option value="Alumni Referral">Alumni Referral</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Assign Counselor</label>
                <select
                  value={assignedCounselorId}
                  onChange={(e) => setAssignedCounselorId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  {staffUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleLabel.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Initial Telecaller / Ingest Note</label>
              <textarea
                rows={2}
                placeholder="Key remarks, preferred hostel accommodations, parent expectations..."
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Stage starts at: <strong className="text-blue-700">New (Uncontacted)</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
              >
                Save Inquiry Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
