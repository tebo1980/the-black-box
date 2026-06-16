export interface HoaViolationPayload {
  noticeReceivedAt: Date;
  meetingOrFineDate: Date;
  hasPublishedSchedule: boolean;
  isSelectiveEnforcement: boolean;
}

export interface HoaViolationResult {
  status: 'ACTIVE' | 'NON_COMPLIANT' | 'RETALIATION_ALARM';
  proceduralViolation: boolean;
  message?: string;
  defenseStrategy?: string[];
}

export function evaluateHoaViolation(payload: HoaViolationPayload): HoaViolationResult {
  const { noticeReceivedAt, meetingOrFineDate, hasPublishedSchedule, isSelectiveEnforcement } = payload;

  const result: HoaViolationResult = {
    status: 'ACTIVE',
    proceduralViolation: false,
  };

  const timeDiffMs = new Date(meetingOrFineDate).getTime() - new Date(noticeReceivedAt).getTime();
  const hoursNotice = timeDiffMs / (1000 * 60 * 60);

  if (hoursNotice < 96) {
    result.proceduralViolation = true;
    result.message = 'HOA failed to provide the mandatory 4-day advance written notice under IN HB 1115.';
    result.status = 'NON_COMPLIANT';
  } else if (!hasPublishedSchedule) {
    result.proceduralViolation = true;
    result.message = 'HOA is legally unauthorized to assess fines without a pre-adopted, board-distributed schedule of violations.';
    result.status = 'NON_COMPLIANT';
  }

  if (isSelectiveEnforcement) {
    result.status = 'RETALIATION_ALARM';
    result.defenseStrategy = ['Generate Selective Enforcement Comparative Ledger for Small Claims Court.'];
  }

  return result;
}
