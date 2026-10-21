/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Lead,
  Course,
  College,
  StaffUser,
  BackupRecord,
  LeadStage,
} from './types';
import {
  loadStoredData,
  saveLeads,
  saveCourses,
  saveColleges,
  saveStaffUsers,
  saveBackups,
  saveActiveUserId,
  exportLeadsToCsv,
} from './utils/storage';
import { findDuplicates } from './utils/deduplication';
import { Header } from './components/Header';
import { KpiSummaryBanner } from './components/KpiSummaryBanner';
import { InquiriesMasterList } from './components/InquiriesMasterList';
import { LeadDetailModal } from './components/LeadDetailModal';
import { AddLeadModal } from './components/AddLeadModal';
import { DeduplicationModal } from './components/DeduplicationModal';
import { CourseCollegeMaster } from './components/CourseCollegeMaster';
import { SchemaViewer } from './components/SchemaViewer';
import { RolesMatrix } from './components/RolesMatrix';
import { BackupModal } from './components/BackupModal';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('usr-1');

  // Navigation tab: 'inquiries' | 'pipeline' | 'catalog' | 'schema' | 'roles'
  const [activeTab, setActiveTab] = useState<'inquiries' | 'pipeline' | 'catalog' | 'schema' | 'roles'>('inquiries');
  const [inquiriesViewMode, setInquiriesViewMode] = useState<'table' | 'pipeline'>('table');

  // Modals
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isDeduplicationOpen, setIsDeduplicationOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Initialize data from localStorage on mount
  useEffect(() => {
    const stored = loadStoredData();
    setLeads(stored.leads);
    setCourses(stored.courses);
    setColleges(stored.colleges);
    setStaffUsers(stored.staff);
    setBackups(stored.backups);
    setActiveUserId(stored.activeUserId);
    setDataLoaded(true);
  }, []);

  // Sync active user
  const activeUser = useMemo(() => {
    return staffUsers.find((u) => u.id === activeUserId) || staffUsers[0] || {
      id: 'usr-1',
      name: 'Dr. Rajesh Sharma',
      email: 'r.sharma@admitflow.edu',
      role: 'super_admin' as const,
      roleLabel: 'Super Admin / Admissions Director',
      department: 'Directorate of Admissions',
      phone: '+91 98110 44210',
    };
  }, [staffUsers, activeUserId]);

  // Compute live duplicate count
  const duplicateMatches = useMemo(() => findDuplicates(leads), [leads]);
  const duplicateCount = duplicateMatches.length;

  // Handlers
  const handleSwitchUser = (userId: string) => {
    setActiveUserId(userId);
    saveActiveUserId(userId);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    const updated = leads.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    setLeads(updated);
    saveLeads(updated);
    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
  };

  const handleAdvanceStage = (leadId: string, targetStage: LeadStage, note?: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const timestamp = new Date().toISOString();
    const historyItem = {
      id: `sh-${Date.now()}`,
      fromStage: targetLead.leadStage,
      toStage: targetStage,
      timestamp,
      changedBy: `${activeUser.name} (${activeUser.roleLabel.split(' ')[0]})`,
      note: note || `Stage advanced to ${targetStage}`,
    };

    const updatedLead: Lead = {
      ...targetLead,
      leadStage: targetStage,
      stageHistory: [historyItem, ...targetLead.stageHistory],
      updatedAt: timestamp,
    };

    handleUpdateLead(updatedLead);
  };

  const handleSaveNewLead = (newLead: Lead) => {
    const updated = [newLead, ...leads];
    setLeads(updated);
    saveLeads(updated);
    setIsAddLeadOpen(false);
  };

  const handleUpdateLeads = (newLeadsList: Lead[]) => {
    setLeads(newLeadsList);
    saveLeads(newLeadsList);
    if (selectedLead) {
      const refreshed = newLeadsList.find((l) => l.id === selectedLead.id);
      setSelectedLead(refreshed || null);
    }
  };

  const handleAddStaffUser = (newUser: StaffUser) => {
    const updated = [...staffUsers, newUser];
    setStaffUsers(updated);
    saveStaffUsers(updated);
  };

  const handleAddCourse = (newCourse: Course) => {
    const updated = [...courses, newCourse];
    setCourses(updated);
    saveCourses(updated);
  };

  const handleAddCollege = (newCollege: College) => {
    const updated = [...colleges, newCollege];
    setColleges(updated);
    saveColleges(updated);
  };

  const handleAddBackup = (newBackup: BackupRecord) => {
    const updated = [newBackup, ...backups];
    setBackups(updated);
    saveBackups(updated);
  };

  const handleRestoreData = (restoredLeads: Lead[], restoredCourses?: Course[], restoredColleges?: College[]) => {
    setLeads(restoredLeads);
    saveLeads(restoredLeads);
    if (restoredCourses && restoredCourses.length > 0) {
      setCourses(restoredCourses);
      saveCourses(restoredCourses);
    }
    if (restoredColleges && restoredColleges.length > 0) {
      setColleges(restoredColleges);
      saveColleges(restoredColleges);
    }
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xs text-slate-500 font-medium">Initializing AdmitFlow CMS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header with Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'pipeline') {
            setInquiriesViewMode('pipeline');
          } else if (tab === 'inquiries') {
            setInquiriesViewMode('table');
          }
        }}
        onOpenAddLead={() => setIsAddLeadOpen(true)}
        staffUsers={staffUsers}
        activeUser={activeUser}
        onSwitchUser={handleSwitchUser}
        duplicateCount={duplicateCount}
        onOpenDeduplication={() => setIsDeduplicationOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* 2. Week 1 KPI Summary Banner (100% active leads, 1 finalized schema, 1 working repository) */}
      <KpiSummaryBanner
        leads={leads}
        duplicateCount={duplicateCount}
        onOpenDeduplication={() => setIsDeduplicationOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenSchema={() => setActiveTab('schema')}
      />

      {/* 3. Main Body Content Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(activeTab === 'inquiries' || activeTab === 'pipeline') && (
          <InquiriesMasterList
            leads={leads}
            courses={courses}
            colleges={colleges}
            staffUsers={staffUsers}
            activeUser={activeUser}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onAdvanceStage={handleAdvanceStage}
            onOpenAddLead={() => setIsAddLeadOpen(true)}
            onExportCsv={() => exportLeadsToCsv(leads, courses, colleges)}
            onOpenDeduplication={() => setIsDeduplicationOpen(true)}
            viewMode={inquiriesViewMode}
            setViewMode={setInquiriesViewMode}
          />
        )}

        {activeTab === 'catalog' && (
          <CourseCollegeMaster
            courses={courses}
            colleges={colleges}
            leads={leads}
            activeUser={activeUser}
            onAddCourse={handleAddCourse}
            onAddCollege={handleAddCollege}
          />
        )}

        {activeTab === 'schema' && <SchemaViewer />}

        {activeTab === 'roles' && (
          <RolesMatrix
            staffUsers={staffUsers}
            activeUser={activeUser}
            onSwitchUser={handleSwitchUser}
            leads={leads}
            onAddStaffUser={handleAddStaffUser}
          />
        )}
      </main>

      {/* 4. Modals and Drawers */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          courses={courses}
          colleges={colleges}
          staffUsers={staffUsers}
          activeUser={activeUser}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          onAdvanceStage={handleAdvanceStage}
        />
      )}

      {isAddLeadOpen && (
        <AddLeadModal
          courses={courses}
          colleges={colleges}
          staffUsers={staffUsers}
          activeUser={activeUser}
          existingLeads={leads}
          onClose={() => setIsAddLeadOpen(false)}
          onSaveLead={handleSaveNewLead}
        />
      )}

      {isDeduplicationOpen && (
        <DeduplicationModal
          leads={leads}
          courses={courses}
          colleges={colleges}
          staffUsers={staffUsers}
          activeUser={activeUser}
          onClose={() => setIsDeduplicationOpen(false)}
          onUpdateLeads={handleUpdateLeads}
        />
      )}

      {isBackupOpen && (
        <BackupModal
          leads={leads}
          courses={courses}
          colleges={colleges}
          staffUsers={staffUsers}
          activeUser={activeUser}
          backups={backups}
          onClose={() => setIsBackupOpen(false)}
          onAddBackup={handleAddBackup}
          onRestoreData={handleRestoreData}
        />
      )}

      {/* 5. Minimal Human Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AdmitFlow CMS</span>
            <span aria-hidden="true">·</span>
            <span>HigherEd Admissions Management System</span>
            <span aria-hidden="true">·</span>
            <span>Week 1 Milestone (21–27 October)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Leads Recorded</span>
            <span aria-hidden="true">·</span>
            <span>1 Finalized Schema</span>
            <span aria-hidden="true">·</span>
            <span>1 Working Repository</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
