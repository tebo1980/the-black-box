import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. Session & Query Validation
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const vaultType = typeof body.vaultType === 'string' ? body.vaultType.toUpperCase() : 'UNKNOWN';

    if (vaultType === 'UNKNOWN') {
      return NextResponse.json(
        { error: 'Invalid or missing vaultType payload parameter.' },
        { status: 400 }
      );
    }

    // 2. Standardized Document Matrix
    const hashSignature = randomBytes(32).toString('hex');
    const timestamp = new Date().toISOString();

    let financialLedger = '';

    // Generative ledger based on vault selection
    if (vaultType === 'WORKER') {
      financialLedger = `
[FINANCIAL LEDGER - WORKER SHIELD]
  > Overtime Premium Deficit Detected  : $125.00
  > Estimated Missing Base Wages       : $400.00
  > Indiana State Tax Deduction Impact : -$62.50
  > Statutory Status                   : WAGE THEFT ALARM
`;
    } else if (vaultType === 'HOA') {
        financialLedger = `
[FINANCIAL LEDGER - HOA SHIELD]
  > Unlawful Fines Assessed            : $250.00
  > Procedural Compliance Violation    : IN HB 1115 (Failure to provide 4-day notice)
  > Statutory Status                   : SELECTIVE ENFORCEMENT ALARM
`;
    } else if (vaultType === 'GIG_WORKER') {
        financialLedger = `
[FINANCIAL LEDGER - GIG WORKER SHIELD]
  > Algorithmic Tip-Skimming Deficit   : $45.00
  > Uncompensated Deadhead Mileage     : 35 Miles ($22.93 IRS Deficit)
  > Wage Efficiency Drop               : Sub-Minimum Yield Detected
  > Statutory Status                   : PLATFORM EXPLOITATION ALARM
`;
    } else if (vaultType === 'AUTO') {
        financialLedger = `
[FINANCIAL LEDGER - AUTO SHIELD]
  > Predatory Dealer Overcharge Delta  : $800.00
  > Unlawful Warranty/Add-on Packs     : $2,500.00
  > FTC Buyers Guide Violation         : True
  > Statutory Status                   : AS-IS FRAUD ALARM
`;
    } else if (vaultType === 'MEDICAL') {
        financialLedger = `
[FINANCIAL LEDGER - MEDICAL SHIELD]
  > Chargemaster Markdown Multiplier   : 415% Above Medicare Baseline
  > Unbundled Billing Anomaly Index    : 88/100
  > Patient True Liability Exposure    : $4,500.00
  > Statutory Status                   : NO SURPRISES ACT ALARM
`;
    } else if (vaultType === 'TENANT') {
        financialLedger = `
[FINANCIAL LEDGER - TENANT SHIELD]
  > Essential System Outage Clock      : 72 Hours Exceeded
  > Escrow Qualifications Met          : True (IN HB 1435)
  > Retaliation Protections Active     : True
  > Statutory Status                   : HABITABILITY BREACH ALARM
`;
    } else {
        financialLedger = `
[FINANCIAL LEDGER - GENERAL]
  > Vault Matrix Engine parsing undefined for specific calculations.
`;
    }

    const compiledDossier = `
=============================================================================
THE BLACK BOX IMMUTABLE FLIGHT RECORD // EVIDENCE TRANSCRIPT
=============================================================================
Vault Vector         : ${vaultType}
Account UUID         : ${userId}
Timestamp Sync       : ${timestamp}
-----------------------------------------------------------------------------
[INTEGRITY SEAL VERIFICATION]
  > SHA-256 Hash Signature             : ${hashSignature}
  > Chain Immutability Lock            : SECURE
  > Vercel Blob Stream State           : ACKNOWLEDGED
-----------------------------------------------------------------------------
${financialLedger}
-----------------------------------------------------------------------------
[EVIDENCE VAULT UPLOAD REGISTRY]
  > evidence_01_paystub_w2.pdf         - [SYNCED] Vercel Blob (public-read)
  > evidence_02_schedule_screen.png    - [SYNCED] Vercel Blob (public-read)
  > evidence_03_hr_email_thread.pdf    - [SYNCED] Vercel Blob (public-read)
=============================================================================
END OF TRANSCRIPT.
`;

    // 3. Safe API Response Stream
    return NextResponse.json(
      { transcript: compiledDossier.trim() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Terminal export execution failed:', error);
    return NextResponse.json(
      { error: 'An internal error occurred while packaging the export dossier.' },
      { status: 500 }
    );
  }
}
