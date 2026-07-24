import { createAdminClient } from '@/lib/supabase/admin';
import { analyzeTranscript } from './intelligence';
import type { FollowUp, OpportunityStatus } from '@/types/leasing';

interface CallRow {
	id: string;
	caller_phone: string | null;
	transcript: string | null;
	status: string;
	created_at: string;
}

export function buildFollowUp(call: CallRow): FollowUp {
	return {
		callId: call.id,
		callerPhone: call.caller_phone,
		opportunity: analyzeTranscript(call.transcript ?? ''),
		status: call.status as OpportunityStatus,
		createdAt: call.created_at,
	};
}

export async function getFollowUps(facilityId: string): Promise<FollowUp[]> {
	const supabase = createAdminClient();

	const { data: calls, error } = await supabase
		.from('calls')
		.select('*')
		.eq('facility_id', facilityId)
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	return calls.map(buildFollowUp);
}

export async function updateFollowUpStatus(callId: string, status: OpportunityStatus): Promise<void> {
	const supabase = createAdminClient();

	const { error } = await supabase.from('calls').update({ status }).eq('id', callId);

	if (error) {
		throw error;
	}
}
