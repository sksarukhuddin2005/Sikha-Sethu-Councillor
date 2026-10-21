import { SchemaTable } from '../types';

export const FINALIZED_DATABASE_TABLES: SchemaTable[] = [
  {
    tableName: 'leads',
    displayName: 'Student Inquiries & Leads',
    description: 'Central transactional entity storing all prospective candidate records, contact details, academic scores, stage states, and counselor assignments.',
    category: 'Transactional',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, description: 'Unique immutable identifier for the student inquiry' },
      { name: 'inquiry_no', type: 'VARCHAR(32)', nullable: false, description: 'Human-readable institutional inquiry sequence (e.g., ADM-2026-1042), UNIQUE constraint' },
      { name: 'name', type: 'VARCHAR(128)', nullable: false, description: 'Full legal name of the prospective student' },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, description: 'Candidate primary email; indexed for deduplication' },
      { name: 'phone', type: 'VARCHAR(20)', nullable: false, description: 'Normalized E.164 primary mobile number with country code; indexed for deduplication' },
      { name: 'parent_phone', type: 'VARCHAR(20)', nullable: true, description: 'Secondary parent or guardian contact number' },
      { name: 'city', type: 'VARCHAR(64)', nullable: false, description: 'Current residence city' },
      { name: 'state', type: 'VARCHAR(64)', nullable: false, description: 'Current residence state / territory' },
      { name: 'target_course_id', type: 'VARCHAR(64)', nullable: false, isForeignKey: true, referencesTable: 'courses.id', description: 'FK reference to courses master table' },
      { name: 'target_college_id', type: 'VARCHAR(64)', nullable: false, isForeignKey: true, referencesTable: 'colleges.id', description: 'FK reference to partner institutions/colleges master' },
      { name: 'academic_record', type: 'JSONB', nullable: false, description: 'Structured JSON containing 10th %, 12th %, stream (PCM/PCB/Commerce), graduation %, entrance test details' },
      { name: 'lead_stage', type: 'ENUM', nullable: false, defaultValue: "'New'", description: "Pipeline stage: 'New' | 'Contacted' | 'Qualified' | 'Counseling' | 'Application' | 'Admission Verified' | 'Closed'" },
      { name: 'priority', type: 'ENUM', nullable: false, defaultValue: "'Normal'", description: "Lead priority level: 'High' | 'Medium' | 'Normal'" },
      { name: 'assigned_counselor_id', type: 'VARCHAR(64)', nullable: true, isForeignKey: true, referencesTable: 'users_staff.id', description: 'FK reference to assigned staff counselor' },
      { name: 'source', type: 'VARCHAR(64)', nullable: false, description: 'Lead acquisition channel (Website, Walk-in, Education Fair, Shiksha, Ads, etc.)' },
      { name: 'admission_fee_paid', type: 'NUMERIC(12,2)', nullable: true, defaultValue: '0.00', description: 'Total verified token/admission fee collected' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'active'", description: "'active' | 'duplicate_merged' | 'archived'" },
      { name: 'next_follow_up_date', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: 'Scheduled follow-up reminder timestamp' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Record ingest timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Record last modification timestamp' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_leads_inquiry_no ON leads (inquiry_no);',
      'CREATE INDEX idx_leads_phone ON leads (phone);',
      'CREATE INDEX idx_leads_email ON leads (email);',
      'CREATE INDEX idx_leads_stage_counselor ON leads (lead_stage, assigned_counselor_id);',
      'CREATE INDEX idx_leads_course_college ON leads (target_course_id, target_college_id);',
    ],
  },
  {
    tableName: 'courses',
    displayName: 'Academic Programs Master',
    description: 'Master catalog of degrees, durations, intake quotas, accreditation benchmarks, and annual fee structures.',
    category: 'Core Master',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Internal primary key (e.g. crs-btech-cse)' },
      { name: 'code', type: 'VARCHAR(32)', nullable: false, description: 'Institutional program code (e.g. BTECH-CSE), UNIQUE' },
      { name: 'name', type: 'VARCHAR(128)', nullable: false, description: 'Official academic program title' },
      { name: 'stream', type: 'VARCHAR(64)', nullable: false, description: 'Discipline: Engineering, Management, Pharmacy, Allied Health, Computing' },
      { name: 'level', type: 'VARCHAR(32)', nullable: false, description: 'Undergraduate or Postgraduate' },
      { name: 'duration_years', type: 'SMALLINT', nullable: false, description: 'Total academic curriculum duration in years' },
      { name: 'intake_seats', type: 'INTEGER', nullable: false, description: 'Total approved annual seat intake quota' },
      { name: 'annual_fee_inr', type: 'NUMERIC(10,2)', nullable: false, description: 'Approved annual tuition fee in INR' },
      { name: 'eligibility_criteria', type: 'TEXT', nullable: false, description: 'Mandatory minimum percentage and pre-requisite subjects' },
      { name: 'accreditation_body', type: 'VARCHAR(64)', nullable: false, description: 'Approving council: AICTE, NBA, PCI, INC, UGC' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Flag whether admissions are currently open' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_courses_code ON courses (code);',
      'CREATE INDEX idx_courses_stream_level ON courses (stream, level);',
    ],
  },
  {
    tableName: 'colleges',
    displayName: 'Campus & Institutions Master',
    description: 'Master list of affiliated constituent institutions, physical campuses, seat allocations, and directorate contacts.',
    category: 'Core Master',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Internal primary key (e.g. clg-apex-tech)' },
      { name: 'code', type: 'VARCHAR(32)', nullable: false, description: 'Institutional accreditation code, UNIQUE' },
      { name: 'name', type: 'VARCHAR(160)', nullable: false, description: 'Full registered legal college name' },
      { name: 'short_name', type: 'VARCHAR(64)', nullable: false, description: 'Abbreviated name for UI displays' },
      { name: 'city', type: 'VARCHAR(64)', nullable: false, description: 'Campus location city' },
      { name: 'state', type: 'VARCHAR(64)', nullable: false, description: 'Campus location state' },
      { name: 'type', type: 'VARCHAR(64)', nullable: false, description: 'Institution charter type' },
      { name: 'accreditation', type: 'VARCHAR(100)', nullable: false, description: 'NAAC rating, NBA accreditation, statutory status' },
      { name: 'total_seat_capacity', type: 'INTEGER', nullable: false, description: 'Aggregate student capacity across all streams' },
      { name: 'admissions_director', type: 'VARCHAR(100)', nullable: false, description: 'Designated head of admissions' },
      { name: 'contact_email', type: 'VARCHAR(255)', nullable: false, description: 'Official campus admissions email' },
      { name: 'contact_phone', type: 'VARCHAR(20)', nullable: false, description: 'Official campus helpline phone' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_colleges_code ON colleges (code);',
      'CREATE INDEX idx_colleges_city ON colleges (city);',
    ],
  },
  {
    tableName: 'users_staff',
    displayName: 'Staff & Login Roles',
    description: 'Institutional user credentials, assigned RBAC roles, departmental affiliations, and active status.',
    category: 'Core Master',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'User identifier' },
      { name: 'name', type: 'VARCHAR(100)', nullable: false, description: 'Staff member name' },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, description: 'Official institutional login email, UNIQUE' },
      { name: 'role', type: 'VARCHAR(40)', nullable: false, description: "RBAC Role: 'super_admin' | 'senior_counselor' | 'frontdesk_telecaller' | 'verification_officer'" },
      { name: 'department', type: 'VARCHAR(80)', nullable: false, description: 'Departmental unit' },
      { name: 'phone', type: 'VARCHAR(20)', nullable: false, description: 'Direct desk or mobile contact' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'TRUE', description: 'Active login entitlement' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_users_email ON users_staff (email);',
      'CREATE INDEX idx_users_role ON users_staff (role);',
    ],
  },
  {
    tableName: 'lead_stage_history',
    displayName: 'Stage Progression Audit Log',
    description: 'Immutable ledger tracking each advancement of a lead through the 7 defined stages with counselor notes.',
    category: 'Audit & Governance',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, description: 'Audit record identifier' },
      { name: 'lead_id', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'leads.id', description: 'FK to target lead' },
      { name: 'from_stage', type: 'VARCHAR(40)', nullable: false, description: 'Pre-transition stage' },
      { name: 'to_stage', type: 'VARCHAR(40)', nullable: false, description: 'Post-transition stage (New -> Contacted -> Qualified -> Counseling -> Application -> Admission Verified -> Closed)' },
      { name: 'changed_by_user_id', type: 'VARCHAR(64)', nullable: false, isForeignKey: true, referencesTable: 'users_staff.id', description: 'Staff user authorizing the change' },
      { name: 'transition_notes', type: 'TEXT', nullable: true, description: 'Mandatory clinical/qualification remarks' },
      { name: 'transitioned_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Exact audit timestamp' },
    ],
    indexes: [
      'CREATE INDEX idx_stage_hist_lead_id ON lead_stage_history (lead_id);',
      'CREATE INDEX idx_stage_hist_transitioned_at ON lead_stage_history (transitioned_at);',
    ],
  },
  {
    tableName: 'lead_notes',
    displayName: 'Counseling Notes & Interactions',
    description: 'Detailed counseling remarks, telecalling summaries, parent concerns, and follow-up commitments.',
    category: 'Transactional',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, description: 'Note identifier' },
      { name: 'lead_id', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'leads.id', description: 'FK to lead' },
      { name: 'author_id', type: 'VARCHAR(64)', nullable: false, isForeignKey: true, referencesTable: 'users_staff.id', description: 'Staff user authoring note' },
      { name: 'note_text', type: 'TEXT', nullable: false, description: 'Full text interaction note' },
      { name: 'stage_at_note', type: 'VARCHAR(40)', nullable: false, description: 'Stage of the lead when note was recorded' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Note entry timestamp' },
    ],
    indexes: [
      'CREATE INDEX idx_lead_notes_lead_id ON lead_notes (lead_id);',
    ],
  },
  {
    tableName: 'backups_registry',
    displayName: 'System Backups & Integrity Registry',
    description: 'Tracks full-database snapshots, export timestamps, cryptographic checksums, and record counts for disaster recovery.',
    category: 'Audit & Governance',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Snapshot ID' },
      { name: 'filename', type: 'VARCHAR(128)', nullable: false, description: 'Export archive filename' },
      { name: 'lead_count', type: 'INTEGER', nullable: false, description: 'Number of active leads in snapshot' },
      { name: 'course_count', type: 'INTEGER', nullable: false, description: 'Number of active courses in snapshot' },
      { name: 'college_count', type: 'INTEGER', nullable: false, description: 'Number of colleges in snapshot' },
      { name: 'file_size_bytes', type: 'INTEGER', nullable: false, description: 'Total payload size in bytes' },
      { name: 'checksum', type: 'VARCHAR(64)', nullable: false, description: 'SHA-256 payload integrity hash' },
      { name: 'created_by_user', type: 'VARCHAR(100)', nullable: false, description: 'Authorized administrator name' },
      { name: 'notes', type: 'TEXT', nullable: true, description: 'Snapshot milestone justification' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Snapshot generation timestamp' },
    ],
    indexes: [
      'CREATE INDEX idx_backups_created_at ON backups_registry (created_at DESC);',
    ],
  },
];

export const POSTGRESQL_DDL_SCRIPT = `-- =====================================================================
-- AdmitFlow HigherEd CMS: Finalized Database Schema (v1.0.0-GA)
-- Milestone: Week 1 (21–27 October) Architecture Lock
-- Compatible with: PostgreSQL 14+, Cloud SQL for PostgreSQL
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types
DO $$ BEGIN
  CREATE TYPE lead_stage_enum AS ENUM (
    'New',
    'Contacted',
    'Qualified',
    'Counseling',
    'Application',
    'Admission Verified',
    'Closed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_priority_enum AS ENUM (
    'High',
    'Medium',
    'Normal'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Courses Master Table
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  stream VARCHAR(64) NOT NULL,
  level VARCHAR(32) NOT NULL,
  duration_years SMALLINT NOT NULL CHECK (duration_years > 0 AND duration_years <= 6),
  intake_seats INTEGER NOT NULL CHECK (intake_seats > 0),
  annual_fee_inr NUMERIC(10,2) NOT NULL CHECK (annual_fee_inr >= 0),
  eligibility_criteria TEXT NOT NULL,
  accreditation_body VARCHAR(64) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Colleges Master Table
CREATE TABLE IF NOT EXISTS colleges (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  short_name VARCHAR(64) NOT NULL,
  city VARCHAR(64) NOT NULL,
  state VARCHAR(64) NOT NULL,
  type VARCHAR(64) NOT NULL,
  accreditation VARCHAR(100) NOT NULL,
  total_seat_capacity INTEGER NOT NULL CHECK (total_seat_capacity > 0),
  admissions_director VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Staff Users & Roles Table
CREATE TABLE IF NOT EXISTS users_staff (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(40) NOT NULL CHECK (role IN ('super_admin', 'senior_counselor', 'frontdesk_telecaller', 'verification_officer')),
  department VARCHAR(80) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Leads & Inquiries Master Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_no VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  parent_phone VARCHAR(20),
  city VARCHAR(64) NOT NULL,
  state VARCHAR(64) NOT NULL,
  target_course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  target_college_id VARCHAR(64) NOT NULL REFERENCES colleges(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  academic_record JSONB NOT NULL DEFAULT '{}'::jsonb,
  lead_stage lead_stage_enum NOT NULL DEFAULT 'New',
  priority lead_priority_enum NOT NULL DEFAULT 'Normal',
  assigned_counselor_id VARCHAR(64) REFERENCES users_staff(id) ON UPDATE CASCADE ON DELETE SET NULL,
  source VARCHAR(64) NOT NULL,
  admission_fee_paid NUMERIC(12,2) DEFAULT 0.00 CHECK (admission_fee_paid >= 0),
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'duplicate_merged', 'archived')),
  merged_into_id UUID REFERENCES leads(id),
  closed_reason VARCHAR(100),
  next_follow_up_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Stage Progression Audit Ledger Table
CREATE TABLE IF NOT EXISTS lead_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_stage VARCHAR(40) NOT NULL,
  to_stage VARCHAR(40) NOT NULL,
  changed_by_user_id VARCHAR(64) NOT NULL REFERENCES users_staff(id),
  transition_notes TEXT,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lead Counseling Notes Table
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_id VARCHAR(64) NOT NULL REFERENCES users_staff(id),
  note_text TEXT NOT NULL,
  stage_at_note VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Backups & Disaster Recovery Registry Table
CREATE TABLE IF NOT EXISTS backups_registry (
  id VARCHAR(64) PRIMARY KEY,
  filename VARCHAR(128) NOT NULL,
  lead_count INTEGER NOT NULL,
  course_count INTEGER NOT NULL,
  college_count INTEGER NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  created_by_user VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance & Deduplication Indexing
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_stage_counselor ON leads(lead_stage, assigned_counselor_id);
CREATE INDEX IF NOT EXISTS idx_leads_course_college ON leads(target_course_id, target_college_id);
CREATE INDEX IF NOT EXISTS idx_stage_hist_lead_id ON lead_stage_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

-- End of Finalized Schema v1.0.0
`;
