import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface CallEvent {
	facilityId: string;

	caller: string;

	transcript?: string;

	outcome?: string;
}

export async function POST(request: Request) {
	let event: CallEvent;

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

	const supabase = createAdminClient();

	const { data: call, error } = await supabase
		.from('calls')
		.insert({
			facility_id: event.facilityId,

			caller_phone: event.caller,

			transcript: event.transcript,

			outcome: event.outcome,
		})
		.select()
		.single();

	if (error) {
		console.error(error);

		return NextResponse.json(
			{
				success: false,
				error: error.message,
			},

			{
				status: 500,
			},
		);
	}

	return NextResponse.json({
		success: true,

		call,
	});
}
