import { describe, expect, it } from 'vitest';
import { parseVapiEndOfCallReport } from './webhook';

// Shape verified against a REAL production webhook delivery (Phase 39
// founder verification, 2026-07-25) — startedAt/endedAt/durationSeconds/
// phoneNumber all live on `message` directly, not nested under `message.call`
// as Vapi's own docs (fetched via WebFetch while building this) suggested.
function endOfCallReportPayload(overrides: Record<string, unknown> = {}) {
	return {
		message: {
			type: 'end-of-call-report',
			endedReason: 'customer-ended-call',
			startedAt: '2026-07-25T10:00:00.000Z',
			endedAt: '2026-07-25T10:02:30.000Z',
			durationSeconds: 150,
			phoneNumber: { number: '+18314329642' },
			call: {
				id: 'call-abc-123',
				customer: { number: '+15125550110' },
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

	it('rounds a fractional durationSeconds, matching what Vapi actually sends', () => {
		const result = parseVapiEndOfCallReport(endOfCallReportPayload({ durationSeconds: 31.104 }));

		expect(result?.durationSeconds).toBe(31);
	});

	it('falls back to computing duration from startedAt/endedAt when durationSeconds is missing', () => {
		const payload = endOfCallReportPayload({ durationSeconds: undefined });

		expect(parseVapiEndOfCallReport(payload)?.durationSeconds).toBe(150);
	});

	it('returns null for a message that is not an end-of-call-report', () => {
		const payload = { message: { type: 'status-update', status: 'in-progress' } };

		expect(parseVapiEndOfCallReport(payload)).toBeNull();
	});

	it('returns null for a payload with no message at all', () => {
		expect(parseVapiEndOfCallReport({})).toBeNull();
		expect(parseVapiEndOfCallReport(null)).toBeNull();
	});

	it('handles a missing transcript, caller, or duration without throwing', () => {
		const payload = endOfCallReportPayload({
			startedAt: undefined,
			endedAt: undefined,
			durationSeconds: undefined,
			phoneNumber: undefined,
			call: { id: 'call-xyz', customer: undefined },
			artifact: {},
		});

		const result = parseVapiEndOfCallReport(payload);

		expect(result).toEqual({
			callId: 'call-xyz',
			callerPhone: null,
			calledNumber: null,
			transcript: null,
			durationSeconds: null,
			endedReason: 'customer-ended-call',
		});
	});

	it('parses a real captured production payload correctly', () => {
		// Condensed from an actual founder-verification call (Phase 39),
		// with the transcript shortened and IDs redacted — everything else
		// is the genuine shape Vapi sent.
		const realPayload = {
			message: {
				type: 'end-of-call-report',
				endedReason: 'customer-ended-call',
				startedAt: '2026-07-25T11:17:14.750Z',
				endedAt: '2026-07-25T11:17:45.854Z',
				durationSeconds: 31.104,
				durationMs: 31104,
				phoneNumber: { number: '+18314329642', provider: 'twilio', status: 'active' },
				customer: { number: '+14086475860' },
				call: {
					id: '019f98fe-5c6c-744f-bcf0-e69d14289dd4',
					customer: { number: '+14086475860' },
					phoneNumberId: '7860256b-2732-4bd1-a1ba-c1ce905b1457',
					status: 'ended',
				},
				artifact: {
					transcript: "AI: Thanks for calling. Can I help you today?\nUser: I'm looking for a 10 by 10 storage unit.",
				},
			},
		};

		expect(parseVapiEndOfCallReport(realPayload)).toEqual({
			callId: '019f98fe-5c6c-744f-bcf0-e69d14289dd4',
			callerPhone: '+14086475860',
			calledNumber: '+18314329642',
			transcript: "AI: Thanks for calling. Can I help you today?\nUser: I'm looking for a 10 by 10 storage unit.",
			durationSeconds: 31,
			endedReason: 'customer-ended-call',
		});
	});
});
