import React, { useState } from 'react';
import { Course, College, Lead, StaffUser } from '../types';
import {
  GraduationCap,
  Building2,
  Users,
  Award,
  Clock,
  Plus,
  Search,
  CheckCircle,
} from 'lucide-react';

interface CourseCollegeMasterProps {
  courses: Course[];
  colleges: College[];
  leads: Lead[];
  activeUser: StaffUser;
  onAddCourse: (newCourse: Course) => void;
  onAddCollege: (newCollege: College) => void;
}

export const CourseCollegeMaster: React.FC<CourseCollegeMasterProps> = ({
  courses,
  colleges,
  leads,
  activeUser,
  onAddCourse,
  onAddCollege,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'colleges'>('courses');
  const [streamFilter, setStreamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new course
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newStream, setNewStream] = useState<Course['stream']>('Engineering & Tech');
  const [newLevel, setNewLevel] = useState<'Undergraduate' | 'Postgraduate'>('Undergraduate');
  const [newDuration, setNewDuration] = useState(4);
  const [newSeats, setNewSeats] = useState(60);
  const [newFees, setNewFees] = useState(150000);
  const [newEligibility, setNewEligibility] = useState('');
  const [newAccreditation, setNewAccreditation] = useState('AICTE Approved');

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    if (streamFilter !== 'all' && c.stream !== streamFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate active inquiry counts mapped to each course
  const courseInquiryCounts = courses.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = leads.filter((l) => l.status === 'active' && l.targetCourseId === c.id).length;
    return acc;
  }, {});

  // Calculate active inquiry counts mapped to each college
  const collegeInquiryCounts = colleges.reduce<Record<string, number>>((acc, col) => {
    acc[col.id] = leads.filter((l) => l.status === 'active' && l.targetCollegeId === col.id).length;
    return acc;
  }, {});

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const courseId = `crs-${newCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newCourseObj: Course = {
      id: courseId,
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      stream: newStream,
      level: newLevel,
      durationYears: Number(newDuration),
      intakeSeats: Number(newSeats),
      annualFeeInr: Number(newFees),
      eligibilityCriteria: newEligibility.trim() || 'Standard entrance and academic qualification required.',
      description: 'Newly provisioned academic degree added to the institutional master catalog.',
      accreditationBody: newAccreditation.trim() || 'AICTE / Statutory Council',
    };

    onAddCourse(newCourseObj);
    setShowAddModal(false);
    setNewCode('');
    setNewName('');
    setNewEligibility('');
  };

  return (
    <div className="space-y-6">
      {/* Catalog Header & Segmented Tab Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide uppercase">
            <span>Institutional Master List</span>
            <span aria-hidden="true">·</span>
            <span>Programs & Campuses Catalog</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Courses & Colleges Master
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Core programs: B.Tech CSE, AI & ML, AI & Data Science, BCA, MBA, B.Pharmacy, and B.Sc Nursing.
          </p>
        </div>

        {/* Tab switcher & New button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic Programs ({courses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('colleges')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'colleges' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Colleges & Campuses ({colleges.length})</span>
            </button>
          </div>

          {['super_admin', 'senior_counselor'].includes(activeUser.role) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Program</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'courses' ? (
        <div className="space-y-4">
          {/* Stream Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium mr-1">Stream:</span>
              {['all', 'Engineering & Tech', 'Computer Applications', 'Management', 'Pharmacy', 'Allied Health Sciences'].map(
                (str) => (
                  <button
                    key={str}
                    onClick={() => setStreamFilter(str)}
                    className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      streamFilter === str
                        ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {str === 'all' ? 'All Streams' : str}
                  </button>
                )
              )}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const activeCount = courseInquiryCounts[course.id] || 0;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Top strip */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {course.code}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                      {course.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {course.stream}
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Program Metrics */}
                    <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-center border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Duration</span>
                        <strong className="text-slate-900 font-mono">{course.durationYears} Yrs</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Intake</span>
                        <strong className="text-slate-900 font-mono tabular-nums">{course.intakeSeats}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Annual Fee</span>
                        <strong className="text-slate-900 font-mono tabular-nums">
                          ₹{(course.annualFeeInr / 1000).toFixed(0)}k
                        </strong>
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div className="mt-3 text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded border border-amber-200/60">
                      <span className="font-bold text-amber-900">Eligibility: </span>
                      <span>{course.eligibilityCriteria}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span className="truncate max-w-[140px]">{course.accreditationBody}</span>
                    </span>

                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-mono tabular-nums">
                      {activeCount} Active Inquir{activeCount === 1 ? 'y' : 'ies'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Colleges View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colleges.map((college) => {
            const activeCount = collegeInquiryCounts[college.id] || 0;
            const offeredCourses = courses.filter((c) => college.offeredCourseIds.includes(c.id));

            return (
              <div
                key={college.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {college.code}
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {college.accreditation}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900">
                    {college.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {college.type} · Est. {college.establishedYear} · {college.city}, {college.state}
                  </div>

                  {/* College Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg text-center border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Capacity</span>
                      <strong className="text-slate-900 font-mono tabular-nums">{college.totalSeatCapacity} Seats</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Campus Desk</span>
                      <strong className="text-slate-900 font-mono">{college.contactPhone}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Active Pipeline</span>
                      <strong className="text-blue-700 font-mono tabular-nums">{activeCount} Inquiries</strong>
                    </div>
                  </div>

                  {/* Programs offered */}
                  <div className="mt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Offered Academic Programs:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {offeredCourses.map((c) => (
                        <span
                          key={c.id}
                          className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {c.code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Director info */}
                <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span>
                    Director: <strong className="text-slate-800">{college.admissionsDirector}</strong>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {college.contactEmail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Add New Academic Program</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Degree Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTECH-ROBOTICS"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech in Robotics & Autonomous Systems"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Duration (Yrs)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Seat Intake</label>
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Annual Fee (INR)</label>
                  <input
                    type="number"
                    value={newFees}
                    onChange={(e) => setNewFees(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  placeholder="e.g. 10+2 PCM min 60% with JEE rank"
                  value={newEligibility}
                  onChange={(e) => setNewEligibility(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                >
                  Save to Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
