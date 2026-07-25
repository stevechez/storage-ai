import { NextResponse } from 'next/server';
import { logCall, type LogCallInput } from '@/lib/storage/calls';

export async function POST(request: Request) {
	let event: LogCallInput;

	try {
		event = await request.json();
	} catch {
		return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
	}

	if (typeof event.facilityId !== 'string' || typeof event.caller !== 'string') {
		return NextResponse.json(
			{ success: false, error: 'facilityId and caller are required' },
			{ status: 400 },
		);
	}

	try {
		const call = await logCall(event);

		return NextResponse.json({
			success: true,

			call,
		});
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},

			{
				status: 500,
			},
		);
	}
}
