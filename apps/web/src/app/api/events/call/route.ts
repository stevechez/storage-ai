import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

console.log('SERVICE KEY EXISTS:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

interface CallEvent {
	facilityId: string;

	caller: string;

	transcript?: string;

	outcome?: string;
}

export async function POST(request: Request) {
	const supabase = createAdminClient();

	const event = (await request.json()) as CallEvent;

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
