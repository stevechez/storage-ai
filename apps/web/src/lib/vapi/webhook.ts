export interface VapiEndOfCallReport {
	callId: string;
	callerPhone: string | null;
	calledNumber: string | null;
	transcript: string | null;
	durationSeconds: number | null;
	endedReason: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function computeDurationFromTimestamps(startedAt: unknown, endedAt: unknown): number | null {
	const started = typeof startedAt === 'string' ? Date.parse(startedAt) : NaN;
	const ended = typeof endedAt === 'string' ? Date.parse(endedAt) : NaN;
	return Number.isFinite(started) && Number.isFinite(ended) ? Math.round((ended - started) / 1000) : null;
}

export function parseVapiEndOfCallReport(payload: unknown): VapiEndOfCallReport | null {
	if (!isRecord(payload) || !isRecord(payload.message)) return null;

	const message = payload.message;
	if (message.type !== 'end-of-call-report') return null;

	// startedAt/endedAt/durationSeconds/phoneNumber live on `message` directly,
	// not nested under `message.call` — confirmed against a real production
	// webhook delivery (Phase 39 founder verification), which didn't match
	// Vapi's own docs closely enough to trust without checking.
	const call = isRecord(message.call) ? message.call : {};
	const customer = isRecord(call.customer) ? call.customer : {};
	const phoneNumber = isRecord(message.phoneNumber) ? message.phoneNumber : {};
	const artifact = isRecord(message.artifact) ? message.artifact : {};

	const durationSeconds =
		typeof message.durationSeconds === 'number'
			? Math.round(message.durationSeconds)
			: computeDurationFromTimestamps(message.startedAt, message.endedAt);

	return {
		callId: typeof call.id === 'string' ? call.id : '',
		callerPhone: typeof customer.number === 'string' ? customer.number : null,
		calledNumber: typeof phoneNumber.number === 'string' ? phoneNumber.number : null,
		transcript: typeof artifact.transcript === 'string' ? artifact.transcript : null,
		durationSeconds,
		endedReason: typeof message.endedReason === 'string' ? message.endedReason : null,
	};
}
