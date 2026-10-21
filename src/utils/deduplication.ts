import { Lead, DuplicateMatch } from '../types';

export function normalizePhone(phone: string): string {
  // Strip non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Return last 10 digits for standard mobile comparison
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function findDuplicates(leads: Lead[]): DuplicateMatch[] {
  const activeLeads = leads.filter((l) => l.status === 'active');
  const matches: DuplicateMatch[] = [];
  const processedPair = new Set<string>();

  // 1. Check exact normalized phone matches
  const phoneMap = new Map<string, Lead[]>();
  for (const lead of activeLeads) {
    const norm = normalizePhone(lead.phone);
    if (!norm) continue;
    if (!phoneMap.has(norm)) phoneMap.set(norm, []);
    phoneMap.get(norm)!.push(lead);
  }

  phoneMap.forEach((groupLeads, normPhone) => {
    if (groupLeads.length > 1) {
      const ids = groupLeads.map((l) => l.id).sort().join('-');
      if (!processedPair.has(ids)) {
        processedPair.add(ids);
        matches.push({
          id: `dup-phone-${normPhone}`,
          reason: 'Exact Phone Match',
          leads: groupLeads,
          detectedAt: new Date().toISOString(),
        });
      }
    }
  });

  // 2. Check exact email matches
  const emailMap = new Map<string, Lead[]>();
  for (const lead of activeLeads) {
    const email = lead.email.trim().toLowerCase();
    if (!email) continue;
    if (!emailMap.has(email)) emailMap.set(email, []);
    emailMap.get(email)!.push(lead);
  }

  emailMap.forEach((groupLeads, email) => {
    if (groupLeads.length > 1) {
      const ids = groupLeads.map((l) => l.id).sort().join('-');
      if (!processedPair.has(ids)) {
        processedPair.add(ids);
        matches.push({
          id: `dup-email-${email.replace(/[^a-z0-9]/g, '_')}`,
          reason: 'Exact Email Match',
          leads: groupLeads,
          detectedAt: new Date().toISOString(),
        });
      }
    }
  });

  // 3. Name & Target Course Match (if not already matched)
  const nameCourseMap = new Map<string, Lead[]>();
  for (const lead of activeLeads) {
    const key = `${lead.name.trim().toLowerCase()}_${lead.targetCourseId}`;
    if (!nameCourseMap.has(key)) nameCourseMap.set(key, []);
    nameCourseMap.get(key)!.push(lead);
  }

  nameCourseMap.forEach((groupLeads, key) => {
    if (groupLeads.length > 1) {
      const ids = groupLeads.map((l) => l.id).sort().join('-');
      if (!processedPair.has(ids)) {
        processedPair.add(ids);
        matches.push({
          id: `dup-name-course-${key.replace(/[^a-z0-9]/g, '_')}`,
          reason: 'Name & Course Match',
          leads: groupLeads,
          detectedAt: new Date().toISOString(),
        });
      }
    }
  });

  return matches;
}

export function mergeLeads(
  leads: Lead[],
  primaryLeadId: string,
  secondaryLeadId: string,
  mergedByStaff: string
): Lead[] {
  const primaryLead = leads.find((l) => l.id === primaryLeadId);
  const secondaryLead = leads.find((l) => l.id === secondaryLeadId);

  if (!primaryLead || !secondaryLead) return leads;

  const timestamp = new Date().toISOString();

  // Combine notes
  const combinedNotes = [...primaryLead.notes];
  for (const note of secondaryLead.notes) {
    combinedNotes.push({
      ...note,
      id: `merged-${note.id}-${Date.now()}`,
      text: `[Merged from ${secondaryLead.inquiryNo}]: ${note.text}`,
    });
  }

  // Update primary lead with secondary fields if primary is blank
  const updatedPrimary: Lead = {
    ...primaryLead,
    parentPhone: primaryLead.parentPhone || secondaryLead.parentPhone,
    notes: combinedNotes,
    admissionFeePaid: Math.max(primaryLead.admissionFeePaid || 0, secondaryLead.admissionFeePaid || 0),
    academicRecord: {
      ...secondaryLead.academicRecord,
      ...primaryLead.academicRecord,
      entranceExamName: primaryLead.academicRecord.entranceExamName || secondaryLead.academicRecord.entranceExamName,
      entranceScoreOrPercentile: primaryLead.academicRecord.entranceScoreOrPercentile || secondaryLead.academicRecord.entranceScoreOrPercentile,
    },
    stageHistory: [
      ...primaryLead.stageHistory,
      {
        id: `sh-merge-${Date.now()}`,
        fromStage: primaryLead.leadStage,
        toStage: primaryLead.leadStage,
        timestamp,
        changedBy: mergedByStaff,
        note: `Merged duplicate inquiry ${secondaryLead.inquiryNo} (${secondaryLead.name}) into master record.`,
      },
    ],
    updatedAt: timestamp,
  };

  // Mark secondary as duplicate_merged
  const updatedSecondary: Lead = {
    ...secondaryLead,
    status: 'duplicate_merged',
    mergedIntoId: primaryLead.id,
    updatedAt: timestamp,
  };

  return leads.map((l) => {
    if (l.id === primaryLeadId) return updatedPrimary;
    if (l.id === secondaryLeadId) return updatedSecondary;
    return l;
  });
}
