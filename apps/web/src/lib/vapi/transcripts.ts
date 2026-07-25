import { createAdminClient } from '@/lib/supabase/admin';
import { logCall } from '@/lib/storage/calls';
import { PILOT_FACILITY_ID } from '@/lib/storage/constants';
import type { VapiEndOfCallReport } from './webhook';

const DUPLICATE_KEY_ERROR = '23505';

/**
 * Stores the raw conversation, then bridges it into the existing calls
 * pipeline via logCall() — the same function manual entry uses, so Vapi
 * calls and manually-logged calls produce identical downstream records
 * (Task 4). The conversation_transcripts insert's unique constraint on
 * vapi_call_id doubles as the idempotency guard: if this same report has
 * already been processed (Vapi retried the webhook), the insert fails
 * with a duplicate-key error and logCall() is deliberately not called a
 * second time.
 */
export async function processVapiEndOfCallReport(
	report: VapiEndOfCallReport,
	rawPayload: unknown,
): Promise<'processed' | 'duplicate' | 'no-transcript'> {
	const supabase = createAdminClient();

	const { error: transcriptError } = await supabase.from('conversation_transcripts').insert({
		vapi_call_id: report.callId,
		facility_id: PILOT_FACILITY_ID,
		caller_phone: report.callerPhone,
		transcript: report.transcript,
		duration_seconds: report.durationSeconds,
		ended_reason: report.endedReason,
		raw_payload: rawPayload,
	});

	if (transcriptError) {
		if (transcriptError.code === DUPLICATE_KEY_ERROR) {
			return 'duplicate';
		}
		throw transcriptError;
	}

	if (!report.transcript) {
		return 'no-transcript';
	}

	await logCall({
		facilityId: PILOT_FACILITY_ID,
		caller: report.callerPhone ?? 'Unknown',
		transcript: report.transcript,
	});

	return 'processed';
}
