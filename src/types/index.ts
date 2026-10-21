export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Counseling'
  | 'Application'
  | 'Admission Verified'
  | 'Closed';

export type LeadPriority = 'High' | 'Medium' | 'Normal';

export type LeadSource =
  | 'Website Inbound'
  | 'Campus Walk-in'
  | 'Education Fair'
  | 'Shiksha Portal'
  | 'CollegeDunia'
  | 'Meta & Google Ads'
  | 'Alumni Referral';

export interface AcademicRecord {
  tenthMarksPercentage: number;
  twelfthMarksPercentage: number;
  twelfthStream: 'PCM' | 'PCB' | 'Commerce' | 'Arts' | 'General';
  graduationPercentage?: number;
  graduationDegree?: string;
  entranceExamName?: string;
  entranceScoreOrPercentile?: string;
}

export interface LeadNote {
  id: string;
  text: string;
  author: string;
  role: string;
  timestamp: string;
  stageAtNote: LeadStage;
}

export interface StageHistoryItem {
  id: string;
  fromStage: LeadStage | 'Initial Ingest';
  toStage: LeadStage;
  timestamp: string;
  changedBy: string;
  note?: string;
}

export interface Lead {
  id: string;
  inquiryNo: string; // e.g. "ADM-2026-1042"
  name: string;
  email: string;
  phone: string;
  parentPhone?: string;
  city: string;
  state: string;
  targetCourseId: string;
  targetCollegeId: string;
  academicRecord: AcademicRecord;
  leadStage: LeadStage;
  priority: LeadPriority;
  assignedCounselorId: string;
  source: LeadSource;
  notes: LeadNote[];
  stageHistory: StageHistoryItem[];
  nextFollowUpDate?: string;
  status: 'active' | 'duplicate_merged' | 'archived';
  mergedIntoId?: string;
  admissionFeePaid?: number;
  closedReason?: 'Enrolled & Paid' | 'Opted for Other College' | 'Budget Constraint' | 'Did not qualify cut-off' | 'No Response';
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  stream: 'Engineering & Tech' | 'Computer Applications' | 'Management' | 'Pharmacy' | 'Allied Health Sciences';
  level: 'Undergraduate' | 'Postgraduate';
  durationYears: number;
  intakeSeats: number;
  annualFeeInr: number;
  eligibilityCriteria: string;
  description: string;
  accreditationBody: string; // e.g. AICTE, NBA, PCI, INC
}

export interface College {
  id: string;
  code: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  type: 'Autonomous University' | 'Engineering College' | 'Health Sciences Institute' | 'Business School';
  accreditation: string; // e.g. NAAC A++, NBA Tier-1, PCI Approved, INC Approved
  establishedYear: number;
  totalSeatCapacity: number;
  admissionsDirector: string;
  contactEmail: string;
  contactPhone: string;
  offeredCourseIds: string[];
}

export type RoleKey =
  | 'super_admin'
  | 'senior_counselor'
  | 'frontdesk_telecaller'
  | 'verification_officer';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  roleLabel: string;
  department: string;
  phone: string;
}

export interface DuplicateMatch {
  id: string;
  reason: 'Exact Phone Match' | 'Exact Email Match' | 'Name & Course Match';
  leads: Lead[];
  detectedAt: string;
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencesTable?: string;
  defaultValue?: string;
  description: string;
}

export interface SchemaTable {
  tableName: string;
  displayName: string;
  description: string;
  category: 'Core Master' | 'Transactional' | 'Audit & Governance';
  primaryKey: string;
  columns: SchemaColumn[];
  indexes: string[];
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  filename: string;
  leadCount: number;
  courseCount: number;
  collegeCount: number;
  fileSizeBytes: number;
  checksum: string;
  createdByUser: string;
  notes: string;
}
