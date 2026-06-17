export interface WorkerViolationPayload {
  basePayRate: number;
  reportedOvertimeHours: number;
  actualLoggedHours: number;
  reportedTips: number;
  actualLoggedTips: number;
  historicalPerformanceScore: number;
  terminationTriggered: boolean;
}

export interface WorkerViolationResult {
  status: 'ACTIVE' | 'NON_COMPLIANT' | 'RETALIATION_ALARM';
  wageTheftDetected: boolean;
  lostOvertimeTaxDeductionValue?: number;
  tipDiscrepancyDelta?: number;
  tipAlertMessage?: string;
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
  } = payload;

  const result: WorkerViolationResult = {
    status: 'ACTIVE',
    wageTheftDetected: false,
    defenseStrategy: [],
  };

  // Overtime Skimming Audit (Indiana SEA 243)
  const actualOvertimeHours = Math.max(0, actualLoggedHours - 40);
  if (reportedOvertimeHours < actualOvertimeHours) {
    result.wageTheftDetected = true;
    result.status = 'NON_COMPLIANT';
    const missingHours = actualOvertimeHours - Math.max(0, reportedOvertimeHours);
    // Calculate the worker's lost tax deduction value: (True Overtime Hours - Reported Overtime Hours) * (basePayRate * 0.5)
    result.lostOvertimeTaxDeductionValue = missingHours * (Math.max(0, basePayRate) * 0.5);
  }

  // Pretextual Retaliation Defenses
  if (terminationTriggered && historicalPerformanceScore > 85) {
    result.status = 'RETALIATION_ALARM';
    result.defenseStrategy!.push('Generate Pretextual Discrimination Comparative Ledger for Small Claims Court');
  }

  // Tip Reporting Tax Discrepancy Matrix
  if (reportedTips < actualLoggedTips) {
    result.wageTheftDetected = true;
    if (result.status !== 'RETALIATION_ALARM') {
      result.status = 'NON_COMPLIANT';
    }
    const delta = Math.max(0, actualLoggedTips) - Math.max(0, reportedTips);
    result.tipDiscrepancyDelta = delta;
    result.tipAlertMessage = "Employer's underreporting limits the worker's ability to claim the maximum $25,000 Indiana 2026 state tip deduction.";
  }

  return result;
}
