export interface AutoViolationPayload {
  advertisedPrice: number;
  totalFinancedAmount: number;
  dealerAddOns: number;
  aprPercentage: number;
  asIsStickerPresent: boolean;
  stateThresholdCap: number;
  actualDocFeeCharged: number;
}

export interface AutoViolationResult {
  status: 'ACTIVE' | 'NON_COMPLIANT' | 'RETALIATION_ALARM';
  disclosureViolationDetected: boolean;
  predatoryMarkupSuspected: boolean;
  feeOverchargeDelta?: number;
  financingRiskRating?: number;
  alerts: string[];
}

export function evaluateAutoViolation(payload: AutoViolationPayload): AutoViolationResult {
  const {
    advertisedPrice,
    totalFinancedAmount,
    dealerAddOns,
    aprPercentage,
    asIsStickerPresent,
    stateThresholdCap,
    actualDocFeeCharged,
  } = payload;

  const result: AutoViolationResult = {
    status: 'ACTIVE',
    disclosureViolationDetected: false,
    predatoryMarkupSuspected: false,
    alerts: [],
  };

  // Mandatory Disclosure Compliance
  if (!asIsStickerPresent) {
    result.disclosureViolationDetected = true;
    result.status = 'NON_COMPLIANT';
    result.alerts.push('Breach of FTC Buyers Guide Rule: As-Is sticker was not physically displayed.');
  }

  // Predatory Fee & Markup Matrix
  if (actualDocFeeCharged > stateThresholdCap) {
    result.status = 'NON_COMPLIANT';
    result.feeOverchargeDelta = actualDocFeeCharged - stateThresholdCap;
    result.alerts.push(`Documentation fee exceeds state statutory limit by $${result.feeOverchargeDelta}.`);
  }

  if (advertisedPrice > 0 && dealerAddOns > advertisedPrice * 0.15) {
    result.predatoryMarkupSuspected = true;
    if (result.status !== 'NON_COMPLIANT' && !result.disclosureViolationDetected) {
       result.status = 'NON_COMPLIANT';
    }
    result.alerts.push('Dealer add-ons exceed 15% of the advertised vehicle price indicating potential predatory packing.');
  }

  // Financing Inflator Index
  const principalVariance = Math.max(0, totalFinancedAmount - advertisedPrice);
  if (advertisedPrice > 0 && principalVariance > 0) {
    // Assuming a rough estimate of 8% for state sales tax logic
    const taxEstimate = advertisedPrice * 0.08;
    const unexplainedInflation = Math.max(0, principalVariance - taxEstimate - dealerAddOns - actualDocFeeCharged);

    // Scale the unexplained inflation as a ratio to the advertised price to derive a 0-100 risk score
    // E.g., if unexplained inflation is 20% of the car price, risk is 100.
    const riskRatio = unexplainedInflation / advertisedPrice;
    let riskScore = Math.round((riskRatio / 0.20) * 100);
    riskScore = Math.min(100, Math.max(0, riskScore));

    result.financingRiskRating = riskScore;

    if (riskScore > 80) {
      result.alerts.push(`High Financing Inflator Risk Detected (Score: ${riskScore}/100): The financed principal drastically exceeds expected tax and fee baselines.`);
    }
  }

  return result;
}
