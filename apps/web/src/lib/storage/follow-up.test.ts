import { describe, expect, it } from 'vitest';
import { buildFollowUp } from './follow-up';

describe('buildFollowUp', () => {
	it('derives a leasing opportunity from the transcript and carries over identity and status', () => {
		const call = {
			id: 'call-1',
			caller_phone: '+15125550110',
			transcript: 'Customer wants a 10x10 unit this weekend. What is the price?',
			status: 'new',
			created_at: '2026-07-23T12:00:00.000Z',
		};

		const followUp = buildFollowUp(call);

		expect(followUp).toEqual({
			callId: 'call-1',
			callerPhone: '+15125550110',
			status: 'new',
			createdAt: '2026-07-23T12:00:00.000Z',
			opportunity: {
				intent: 'rental',
				unitSize: '10x10',
				timeline: 'this weekend',
				priority: 'high',
				recommendedAction: 'Send pricing and availability',
			},
		});
	});

	it('treats a missing transcript as a general opportunity and preserves the stored status', () => {
		const call = {
			id: 'call-2',
			caller_phone: null,
			transcript: null,
			status: 'contacted',
			created_at: '2026-07-23T08:00:00.000Z',
		};

		const followUp = buildFollowUp(call);

		expect(followUp.callerPhone).toBeNull();
		expect(followUp.status).toBe('contacted');
		expect(followUp.opportunity.intent).toBe('general');
	});
});
