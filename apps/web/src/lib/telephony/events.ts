import { createAdminClient } from '@/lib/supabase/admin';

export interface TelephonyEventInput {
	callSid: string;
	fromNumber: string | null;
	toNumber: string | null;
	direction: string | null;
	callStatus: string | null;
}

export function parseTwilioVoiceParams(params: Record<string, string>): TelephonyEventInput {
	return {
		callSid: params.CallSid ?? '',
		fromNumber: params.From ?? null,
		toNumber: params.To ?? null,
		direction: params.Direction ?? null,
		callStatus: params.CallStatus ?? null,
	};
}

export async function logTelephonyEvent(input: TelephonyEventInput) {
	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from('telephony_events')
		.insert({
			call_sid: input.callSid,
			from_number: input.fromNumber,
			to_number: input.toNumber,
			direction: input.direction,
			call_status: input.callStatus,
		})
		.select()
		.single();

	if (error) {
		throw error;
	}

	return data;
}
