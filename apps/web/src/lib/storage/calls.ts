import { createAdminClient } from '@/lib/supabase/admin';

export interface LogCallInput {
	facilityId: string;
	caller: string;
	transcript?: string;
	outcome?: string;
}

export async function logCall(input: LogCallInput) {
	const supabase = createAdminClient();

	const { data: call, error } = await supabase
		.from('calls')
		.insert({
			facility_id: input.facilityId,
			caller_phone: input.caller,
			transcript: input.transcript,
			outcome: input.outcome,
		})
		.select()
		.single();

	if (error) {
		throw error;
	}

	return call;
}
