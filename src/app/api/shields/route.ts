import { NextResponse } from 'next/server';
import { calculateTenantCompliance, type TenantIncidentPayload } from '../../../lib/engines/tenant-shield.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.vaultType === 'TENANT') {
      const payload: TenantIncidentPayload = {
        reportedAt: new Date(body.reportedAt),
        jurisdiction: body.jurisdiction,
        isEssentialSystem: body.isEssentialSystem,
        isReopened: body.isReopened,
      };

      const result = calculateTenantCompliance(payload);
      return NextResponse.json(result);
    }

    // Handlers for other vault types can be added here
    return NextResponse.json({ error: 'Unsupported vault type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
