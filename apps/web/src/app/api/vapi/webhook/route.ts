import { NextResponse } from 'next/server';
import { parseVapiEndOfCallReport } from '@/lib/vapi/webhook';
import { processVapiEndOfCallReport } from '@/lib/vapi/transcripts';

const SECRET_HEADER = 'x-vapi-webhook-secret';

export async function POST(request: Request) {
	if (process.env.NODE_ENV === 'production') {
		const expected = process.env.VAPI_WEBHOOK_SECRET;
		const received = request.headers.get(SECRET_HEADER);

		if (!expected || received !== expected) {
			console.error('Rejected Vapi webhook: missing or invalid secret header');
			return new NextResponse('Forbidden', { status: 403 });
		}
	} else {
		console.warn('Vapi webhook secret check skipped — NODE_ENV is not "production"');
	}

	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const report = parseVapiEndOfCallReport(payload);

	if (!report) {
		// Vapi sends many message types (status-update, transcript, etc.) to
		// the same Server URL — only end-of-call-report matters here.
		// Acknowledge and ignore the rest rather than erroring on them.
		return NextResponse.json({ received: true });
	}

	try {
		const result = await processVapiEndOfCallReport(report, payload);
		return NextResponse.json({ received: true, result });
	} catch (error) {
		console.error('Failed to process Vapi end-of-call report', error);
		return NextResponse.json({ received: true, result: 'error' });
	}
}
