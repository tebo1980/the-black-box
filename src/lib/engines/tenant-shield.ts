export interface TenantIncidentPayload {
  reportedAt: Date;
  jurisdiction: 'IN' | 'KY';
  isEssentialSystem: boolean;
  isReopened: boolean;
}

export interface TenantComplianceResult {
  status: 'ACTIVE' | 'NON_COMPLIANT' | 'RETALIATION_ALARM';
  hoursRemaining: number;
  statuteCode: string;
  isPretextualRepairFailure?: boolean;
}

export function calculateTenantCompliance(payload: TenantIncidentPayload): TenantComplianceResult {
  const { reportedAt, jurisdiction, isEssentialSystem, isReopened } = payload;
  const now = new Date();
  const timeDiffMs = now.getTime() - new Date(reportedAt).getTime();
  const hoursElapsed = timeDiffMs / (1000 * 60 * 60);

  if (isReopened) {
    return {
      status: 'RETALIATION_ALARM',
      hoursRemaining: 0,
      statuteCode: jurisdiction === 'IN' ? 'IN_HB_1435' : 'KRS_383_625',
      isPretextualRepairFailure: true,
    };
  }

  let totalHoursAllowed = 0;
  let statuteCode = '';

  if (jurisdiction === 'IN' && isEssentialSystem) {
    totalHoursAllowed = 72;
    statuteCode = 'IN_HB_1435';
  } else if (jurisdiction === 'KY') {
    totalHoursAllowed = 14 * 24; // 14 days
    statuteCode = 'KRS_383_625';
  } else {
    // Default fallback or non-essential for IN
    totalHoursAllowed = 14 * 24; // Assuming 14 days default for non-essential
    statuteCode = jurisdiction === 'IN' ? 'IN_HB_1435' : 'KRS_383_625';
  }

  const hoursRemaining = totalHoursAllowed - hoursElapsed;
  const status = hoursRemaining <= 0 ? 'NON_COMPLIANT' : 'ACTIVE';

  return {
    status,
    hoursRemaining,
    statuteCode,
  };
}
