import { createAdminClient } from '@/lib/supabase/admin';
import { logCall } from '@/lib/storage/calls';
import { getFacilityByPhoneNumber } from '@/lib/storage/facility';
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
 *
 * Phase 41: the facility is resolved from the number the caller actually
 * dialed (report.calledNumber), via facilities.twilio_phone_number —
 * replacing a hardcoded single-facility constant so a second facility can
 * be onboarded by configuration alone, not a code change.
 */
export async function processVapiEndOfCallReport(
	report: VapiEndOfCallReport,
	rawPayload: unknown,
): Promise<'processed' | 'duplicate' | 'no-transcript'> {
	if (!report.calledNumber) {
		throw new Error('Vapi end-of-call report is missing the called number — cannot resolve a facility.');
	}

	const facility = await getFacilityByPhoneNumber(report.calledNumber);

	if (!facility) {
		throw new Error(`No facility is configured for phone number ${report.calledNumber}`);
	}

	const supabase = createAdminClient();

	const { error: transcriptError } = await supabase.from('conversation_transcripts').insert({
		vapi_call_id: report.callId,
		facility_id: facility.id,
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
		facilityId: facility.id,
		caller: report.callerPhone ?? 'Unknown',
		transcript: report.transcript,
	});

	return 'processed';
}
