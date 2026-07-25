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

export function parseVapiEndOfCallReport(payload: unknown): VapiEndOfCallReport | null {
	if (!isRecord(payload) || !isRecord(payload.message)) return null;

	const message = payload.message;
	if (message.type !== 'end-of-call-report') return null;

	const call = isRecord(message.call) ? message.call : {};
	const customer = isRecord(call.customer) ? call.customer : {};
	const phoneNumber = isRecord(call.phoneNumber) ? call.phoneNumber : {};
	const artifact = isRecord(message.artifact) ? message.artifact : {};

	const startedAt = typeof call.startedAt === 'string' ? Date.parse(call.startedAt) : NaN;
	const endedAt = typeof call.endedAt === 'string' ? Date.parse(call.endedAt) : NaN;
	const durationSeconds =
		Number.isFinite(startedAt) && Number.isFinite(endedAt) ? Math.round((endedAt - startedAt) / 1000) : null;

	return {
		callId: typeof call.id === 'string' ? call.id : '',
		callerPhone: typeof customer.number === 'string' ? customer.number : null,
		calledNumber: typeof phoneNumber.number === 'string' ? phoneNumber.number : null,
		transcript: typeof artifact.transcript === 'string' ? artifact.transcript : null,
		durationSeconds,
		endedReason: typeof message.endedReason === 'string' ? message.endedReason : null,
	};
}
