import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    // 1. Session Security Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Multi-part Form Parsing
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const vaultType = formData.get('vaultType') as string | null;

    if (!file || !vaultType) {
      return NextResponse.json(
        { error: 'Missing file or vaultType in payload' },
        { status: 400 }
      );
    }

    // 3. File Validation Matrix
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 5MB limit' },
        { status: 400 }
      );
    }

    const validMimeTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, PNG, and JPEG are supported.' },
        { status: 400 }
      );
    }

    // 4. Vercel Blob Live Staging
    const filename = `${vaultType}/${file.name}`;
    let blob;
    try {
      blob = await put(filename, file, { access: 'public' });
    } catch (uploadError) {
      console.error('Vercel Blob upload stream exception:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload document to the cloud storage.' },
        { status: 500 }
      );
    }

    // 5. Return Payload
    return NextResponse.json(
      {
        success: true,
        url: blob.url,
        size: file.size,
        message: 'Document successfully streamed and immutably stored in the security vault.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('File stream exception:', error);
    return NextResponse.json(
      { error: 'An error occurred during file ingestion.' },
      { status: 500 }
    );
  }
}
