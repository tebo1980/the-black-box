export interface MedicalViolationPayload {
  totalChargedAmount: number;
  itemizedLineItemsCount: number;
  sampleProceduresCharged: number;
  medicareRegionalAllowableCap: number;
  standardInsuranceCoveredAmount: number;
  unbundledBillingSuspected: boolean;
}

export interface MedicalViolationResult {
  status: 'ACTIVE' | 'NON_COMPLIANT' | 'RETALIATION_ALARM';
  excessiveMarkupDetected: boolean;
  chargemasterMarkupMultiplier?: number;
  markupDelta?: number;
  reviewLineItems: boolean;
  billingAnomalyRiskScore?: number;
  patientLiabilityWarning?: string;
  trueLiabilityAmount?: number;
}

export function evaluateMedicalViolation(payload: MedicalViolationPayload): MedicalViolationResult {
  const {
    totalChargedAmount,
    itemizedLineItemsCount,
    sampleProceduresCharged,
    medicareRegionalAllowableCap,
    standardInsuranceCoveredAmount,
    unbundledBillingSuspected,
  } = payload;

  const result: MedicalViolationResult = {
    status: 'ACTIVE',
    excessiveMarkupDetected: false,
    reviewLineItems: false,
  };

  // Hospital Chargemaster Markup Audit
  if (medicareRegionalAllowableCap > 0) {
    const markupMultiplier = sampleProceduresCharged / medicareRegionalAllowableCap;
    result.chargemasterMarkupMultiplier = markupMultiplier;

    if (markupMultiplier > 3) { // Exceeds baseline cap by more than 300%
      result.excessiveMarkupDetected = true;
      result.status = 'NON_COMPLIANT';
      result.markupDelta = Math.max(0, sampleProceduresCharged - medicareRegionalAllowableCap);
    }
  }

  // Unbundled Fraud Detection Matrix
  if (unbundledBillingSuspected || itemizedLineItemsCount > 25) {
    result.reviewLineItems = true;
    if (result.status !== 'NON_COMPLIANT') {
        result.status = 'NON_COMPLIANT';
    }

    // Calculate a systemic billing anomaly risk score (0-100)
    let anomalyScore = 0;
    if (unbundledBillingSuspected) anomalyScore += 50;

    // Scale risk by line items if over standard threshold
    if (itemizedLineItemsCount > 25) {
       const excessItems = itemizedLineItemsCount - 25;
       anomalyScore += Math.min(50, excessItems * 2); // Max +50 from item count
    }

    result.billingAnomalyRiskScore = Math.min(100, Math.max(0, anomalyScore));
  }

  // Patient True Liability Deficit
  const outOfPocketLiability = Math.max(0, totalChargedAmount - standardInsuranceCoveredAmount);
  result.trueLiabilityAmount = outOfPocketLiability;

  // Render a consumer protective warning if remaining liability > threshold
  // (e.g. Assuming an arbitrary standard threshold of $1,000 for warning)
  const STANDARD_CONSUMER_THRESHOLD = 1000;
  if (outOfPocketLiability > STANDARD_CONSUMER_THRESHOLD) {
    result.patientLiabilityWarning = `Priority Alert: Remaining out-of-pocket liability ($${outOfPocketLiability.toFixed(2)}) exceeds standard protective consumer thresholds. Consider requesting an itemized audit under the No Surprises Act.`;
  }

  return result;
}
