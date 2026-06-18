export interface GigWorkerViolationPayload {
  contractBasePay: number;
  finalDisbursedPay: number;
  estimatedMiles: number;
  actualDrivenMiles: number;
  appUpTimeHours: number;
  tipAmountPromised: number;
  tipAmountReceived: number;
}

export interface GigWorkerViolationResult {
  status: 'ACTIVE' | 'NON_COMPLIANT' | 'RETALIATION_ALARM';
  tipTheftSuspected: boolean;
  lostTipDelta?: number;
  underCompensationPenalty?: number;
  wageEfficiencyAlert?: string;
  trueHourlyYield?: number;
}

export function evaluateGigViolation(payload: GigWorkerViolationPayload): GigWorkerViolationResult {
  const {
    contractBasePay,
    finalDisbursedPay,
    estimatedMiles,
    actualDrivenMiles,
    appUpTimeHours,
    tipAmountPromised,
    tipAmountReceived,
  } = payload;

  const result: GigWorkerViolationResult = {
    status: 'ACTIVE',
    tipTheftSuspected: false,
  };

  // Algorithmic Tip-Skimming Matrix
  if (tipAmountReceived < tipAmountPromised) {
    result.tipTheftSuspected = true;
    result.status = 'NON_COMPLIANT';
    result.lostTipDelta = Math.max(0, tipAmountPromised) - Math.max(0, tipAmountReceived);
  }

  // Deadhead & Under-Compensation Audit
  const mileageVariance = Math.max(0, actualDrivenMiles) - Math.max(0, estimatedMiles);
  if (estimatedMiles > 0 && mileageVariance > estimatedMiles * 0.15) {
    // 0.655 is the federal business mileage rate benchmark
    result.underCompensationPenalty = mileageVariance * 0.655;
    if (result.status !== 'RETALIATION_ALARM') {
      result.status = 'NON_COMPLIANT';
    }
  }

  // Active Wage Efficiency Index
  if (appUpTimeHours > 0) {
    const trueHourlyYield = finalDisbursedPay / appUpTimeHours;
    result.trueHourlyYield = trueHourlyYield;

    // Alerting if it drops below a standard $7.25 federal minimum threshold
    // Local statutes may vary, but flagging extreme dead zones is the goal.
    if (trueHourlyYield < 7.25) {
      result.wageEfficiencyAlert = 'Priority Alert: True hourly yield dropped below statutory minimum wage baselines due to operational dead zones.';
    }
  }

  return result;
}
