import { describe, expect, it } from 'vitest';
import { buildResponseMessage, generateResponseDraft } from './responses';
import type { FollowUp, LeasingOpportunity } from '@/types/leasing';

describe('buildResponseMessage', () => {
	it('mentions the unit size and timeline for a rental inquiry', () => {
		const opportunity: LeasingOpportunity = {
			intent: 'rental',
			unitSize: '10x10',
			timeline: 'this weekend',
			priority: 'high',
			recommendedAction: 'Send pricing and availability',
		};

		expect(buildResponseMessage(opportunity)).toBe(
			[
				'Hi there,',
				'Thanks for reaching out about a 10x10 unit.',
				'We can help you get set up this weekend.',
				'I can provide pricing and availability details.',
				'How can we help?',
			].join('\n\n'),
		);
	});

	it('falls back to generic phrasing when unit size and timeline are unknown', () => {
		const opportunity: LeasingOpportunity = {
			intent: 'pricing',
			priority: 'medium',
			recommendedAction: 'Send pricing information',
		};

		expect(buildResponseMessage(opportunity)).toBe(
			[
				'Hi there,',
				'Thanks for asking about pricing for a storage unit.',
				"Here's a breakdown of pricing and next steps.",
				'How can we help?',
			].join('\n\n'),
		);
	});

	it('does not fabricate a customer name', () => {
		const opportunity: LeasingOpportunity = {
			intent: 'general',
			priority: 'low',
			recommendedAction: 'Follow up with renter',
		};

		expect(buildResponseMessage(opportunity)).not.toMatch(/Hi [A-Z][a-z]+,/);
	});
});

describe('generateResponseDraft', () => {
	it('ties the draft to the originating call and defaults to the phone channel', () => {
		const followUp: FollowUp = {
			callId: 'call-1',
			callerPhone: '+15125550110',
			status: 'new',
			opportunity: {
				intent: 'rental',
				unitSize: '10x10',
				timeline: 'this weekend',
				priority: 'high',
				recommendedAction: 'Send pricing and availability',
			},
		};

		const draft = generateResponseDraft(followUp);

		expect(draft.callId).toBe('call-1');
		expect(draft.channel).toBe('phone');
		expect(draft.message).toBe(buildResponseMessage(followUp.opportunity));
	});
});
