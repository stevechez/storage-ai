import { describe, expect, it } from 'vitest';
import { parseVapiEndOfCallReport } from './webhook';

function endOfCallReportPayload(overrides: Record<string, unknown> = {}) {
	return {
		message: {
			type: 'end-of-call-report',
			endedReason: 'customer-ended-call',
			call: {
				id: 'call-abc-123',
				customer: { number: '+15125550110' },
				phoneNumber: { number: '+18314329642' },
				startedAt: '2026-07-25T10:00:00.000Z',
				endedAt: '2026-07-25T10:02:30.000Z',
			},
			artifact: {
				transcript: 'AI: Hello, thanks for calling.\nUser: Hi, I need a unit.',
			},
			...overrides,
		},
	};
}

describe('parseVapiEndOfCallReport', () => {
	it('parses a well-formed end-of-call-report into caller, transcript, and duration', () => {
		const result = parseVapiEndOfCallReport(endOfCallReportPayload());

		expect(result).toEqual({
			callId: 'call-abc-123',
			callerPhone: '+15125550110',
			calledNumber: '+18314329642',
			transcript: 'AI: Hello, thanks for calling.\nUser: Hi, I need a unit.',
			durationSeconds: 150,
			endedReason: 'customer-ended-call',
		});
	});

	it('returns null for a message that is not an end-of-call-report', () => {
		const payload = { message: { type: 'status-update', status: 'in-progress' } };

		expect(parseVapiEndOfCallReport(payload)).toBeNull();
	});

	it('returns null for a payload with no message at all', () => {
		expect(parseVapiEndOfCallReport({})).toBeNull();
		expect(parseVapiEndOfCallReport(null)).toBeNull();
	});

	it('handles a missing transcript or caller number without throwing', () => {
		const payload = endOfCallReportPayload({
			call: { id: 'call-xyz', startedAt: '2026-07-25T10:00:00.000Z', endedAt: '2026-07-25T10:00:10.000Z' },
			artifact: {},
		});

		const result = parseVapiEndOfCallReport(payload);

		expect(result).toEqual({
			callId: 'call-xyz',
			callerPhone: null,
			calledNumber: null,
			transcript: null,
			durationSeconds: 10,
			endedReason: 'customer-ended-call',
		});
	});
});
