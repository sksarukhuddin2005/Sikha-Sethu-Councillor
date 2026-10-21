import { Lead, Course, College, StaffUser, BackupRecord } from '../types';
import { INITIAL_LEADS, INITIAL_COURSES, INITIAL_COLLEGES, INITIAL_STAFF_USERS, INITIAL_BACKUPS } from '../data/initialData';

const STORAGE_KEYS = {
  LEADS: 'admitflow_leads_v1',
  COURSES: 'admitflow_courses_v1',
  COLLEGES: 'admitflow_colleges_v1',
  STAFF: 'admitflow_staff_v1',
  BACKUPS: 'admitflow_backups_v1',
  ACTIVE_USER_ID: 'admitflow_active_user_id_v1',
};

export function loadStoredData() {
  try {
    const rawLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
    const rawCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
    const rawColleges = localStorage.getItem(STORAGE_KEYS.COLLEGES);
    const rawStaff = localStorage.getItem(STORAGE_KEYS.STAFF);
    const rawBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS);
    const rawActiveUserId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);

    return {
      leads: rawLeads ? (JSON.parse(rawLeads) as Lead[]) : INITIAL_LEADS,
      courses: rawCourses ? (JSON.parse(rawCourses) as Course[]) : INITIAL_COURSES,
      colleges: rawColleges ? (JSON.parse(rawColleges) as College[]) : INITIAL_COLLEGES,
      staff: rawStaff ? (JSON.parse(rawStaff) as StaffUser[]) : INITIAL_STAFF_USERS,
      backups: rawBackups ? (JSON.parse(rawBackups) as BackupRecord[]) : INITIAL_BACKUPS,
      activeUserId: rawActiveUserId || 'usr-1',
    };
  } catch (err) {
    console.error('Error loading stored data:', err);
    return {
      leads: INITIAL_LEADS,
      courses: INITIAL_COURSES,
      colleges: INITIAL_COLLEGES,
      staff: INITIAL_STAFF_USERS,
      backups: INITIAL_BACKUPS,
      activeUserId: 'usr-1',
    };
  }
}

export function saveLeads(leads: Lead[]) {
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
}

export function saveCourses(courses: Course[]) {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function saveColleges(colleges: College[]) {
  localStorage.setItem(STORAGE_KEYS.COLLEGES, JSON.stringify(colleges));
}

export function saveStaffUsers(staff: StaffUser[]) {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
}

export function saveBackups(backups: BackupRecord[]) {
  localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
}

export function saveActiveUserId(userId: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
}

export function createBackupSnapshot(
  leads: Lead[],
  courses: Course[],
  colleges: College[],
  staff: StaffUser[],
  createdByUser: string,
  notes: string
): { backupRecord: BackupRecord; jsonPayload: string } {
  const timestamp = new Date().toISOString();
  const dateFormatted = timestamp.slice(0, 10).replace(/-/g, '');
  const snapshotId = `bkp-${dateFormatted}-${Math.floor(100 + Math.random() * 900)}`;
  const filename = `admitflow_backup_${dateFormatted}_${Date.now()}.json`;

  const payload = {
    metadata: {
      application: 'AdmitFlow CMS',
      version: '1.0.0-GA',
      milestone: 'Week 1: Organize and define (21–27 October)',
      exportedAt: timestamp,
      exportedBy: createdByUser,
      checksumAlgorithm: 'SHA-256-Simulated',
    },
    counts: {
      activeLeads: leads.filter((l) => l.status === 'active').length,
      totalLeads: leads.length,
      courses: courses.length,
      colleges: colleges.length,
    },
    data: {
      leads,
      courses,
      colleges,
      staff,
    },
  };

  const jsonPayload = JSON.stringify(payload, null, 2);
  const fileSizeBytes = new Blob([jsonPayload]).size;
  const checksum = `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

  const backupRecord: BackupRecord = {
    id: snapshotId,
    timestamp,
    filename,
    leadCount: leads.length,
    courseCount: courses.length,
    collegeCount: colleges.length,
    fileSizeBytes,
    checksum,
    createdByUser,
    notes,
  };

  return { backupRecord, jsonPayload };
}

export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLeadsToCsv(leads: Lead[], courses: Course[], colleges: College[]) {
  const courseMap = new Map(courses.map((c) => [c.id, c.code]));
  const collegeMap = new Map(colleges.map((c) => [c.id, c.shortName]));

  const headers = [
    'Inquiry No',
    'Student Name',
    'Email',
    'Phone',
    'Parent Phone',
    'City',
    'State',
    'Target Program',
    'Target College',
    'Lead Stage',
    'Priority',
    'Source',
    '10th %',
    '12th %',
    'Stream',
    'Entrance Exam',
    'Entrance Score',
    'Fee Paid (INR)',
    'Status',
    'Created At',
  ];

  const rows = leads.map((l) => [
    `"${l.inquiryNo}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email}"`,
    `"${l.phone}"`,
    `"${l.parentPhone || ''}"`,
    `"${l.city}"`,
    `"${l.state}"`,
    `"${courseMap.get(l.targetCourseId) || l.targetCourseId}"`,
    `"${collegeMap.get(l.targetCollegeId) || l.targetCollegeId}"`,
    `"${l.leadStage}"`,
    `"${l.priority}"`,
    `"${l.source}"`,
    l.academicRecord.tenthMarksPercentage || '',
    l.academicRecord.twelfthMarksPercentage || '',
    `"${l.academicRecord.twelfthStream || ''}"`,
    `"${l.academicRecord.entranceExamName || ''}"`,
    `"${l.academicRecord.entranceScoreOrPercentile || ''}"`,
    l.admissionFeePaid || 0,
    `"${l.status}"`,
    `"${l.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `admitflow_student_inquiries_master_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}
