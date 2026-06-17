export interface WorkerViolationPayload {
  basePayRate: number;
  reportedOvertimeHours: number;
  actualLoggedHours: number;
  reportedTips: number;
  actualLoggedTips: number; // For baseline comparison
  historicalPerformanceScore: number;
  terminationTriggered: boolean;
  wageDisputeInquiry?: boolean; // Context flag for retaliation audit
}

export interface WorkerViolationResult {
  status: 'ACTIVE' | 'NON_COMPLIANT' | 'RETALIATION_ALARM';
  wageTheftDetected: boolean;
  missingOvertimePremium?: number;
  payrollDiscrepancyCode?: string;
  defenseStrategy?: string[];
}

export function evaluateWorkerViolation(payload: WorkerViolationPayload): WorkerViolationResult {
  const {
    basePayRate,
    reportedOvertimeHours,
    actualLoggedHours,
    reportedTips,
    actualLoggedTips,
    historicalPerformanceScore,
    terminationTriggered,
    wageDisputeInquiry,
  } = payload;

  const result: WorkerViolationResult = {
    status: 'ACTIVE',
    wageTheftDetected: false,
    defenseStrategy: [],
  };

  // Overtime Skimming Audit
  const actualOvertimeHours = Math.max(0, actualLoggedHours - 40);
  if (reportedOvertimeHours < actualOvertimeHours) {
    result.wageTheftDetected = true;
    result.status = 'NON_COMPLIANT';
    const missingHours = actualOvertimeHours - reportedOvertimeHours;
    // FLSA regular rate standard: Time and a half
    result.missingOvertimePremium = missingHours * (basePayRate * 1.5);
  }

  // Pretextual Retaliation Audit
  if (terminationTriggered && historicalPerformanceScore > 85 && wageDisputeInquiry) {
    result.status = 'RETALIATION_ALARM';
    result.defenseStrategy!.push('Generate Pretextual Discrimination Comparison Ledger');
  }

  // Tip-Reporting Discrepancy Matrix
  if (reportedTips < actualLoggedTips) {
    result.wageTheftDetected = true;
    if (result.status !== 'RETALIATION_ALARM') {
      result.status = 'NON_COMPLIANT';
    }
    result.payrollDiscrepancyCode = 'ERR_TIP_SKIMMING_DETECTED_2026';
    result.defenseStrategy!.push('Audit W-2 Box 14 for Tip Discrepancies affecting State Tax Deductions.');
  }

  return result;
}
