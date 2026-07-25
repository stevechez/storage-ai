import { describe, expect, it } from 'vitest';
import { analyzeTranscript, describePriorityReason } from './intelligence';

describe('analyzeTranscript', () => {
	it('extracts a rental opportunity from a transcript mentioning unit size, timeline, and price', () => {
		const transcript = 'Customer wants a 10x10 unit this weekend. What is the price?';

		const result = analyzeTranscript(transcript);

		expect(result).toEqual({
			intent: 'rental',
			unitSize: '10x10',
			timeline: 'this weekend',
			priority: 'high',
			recommendedAction: 'Send pricing and availability',
		});
	});

	it('recommends following up with the customer when no specific intent is detected', () => {
		const transcript = 'Hi, just calling to check in.';

		const result = analyzeTranscript(transcript);

		expect(result.recommendedAction).toBe('Follow up with customer');
	});

	it('recommends sending an availability link for a rental request with no pricing question', () => {
		const transcript = 'Customer wants a unit for their move next month.';

		const result = analyzeTranscript(transcript);

		expect(result.intent).toBe('rental');
		expect(result.recommendedAction).toBe('Send availability link');
	});

	it('recommends sending pricing information for a pricing-only question', () => {
		const transcript = 'How much does it cost per month?';

		const result = analyzeTranscript(transcript);

		expect(result.intent).toBe('pricing');
		expect(result.recommendedAction).toBe('Send pricing information');
	});

	it('recommends sending availability information for an availability-only question', () => {
		const transcript = 'Is anything available right now?';

		const result = analyzeTranscript(transcript);

		expect(result.intent).toBe('availability');
		expect(result.recommendedAction).toBe('Send availability information');
	});
});

describe('describePriorityReason', () => {
	it('explains high priority by naming the timeline the customer gave', () => {
		const opportunity = analyzeTranscript('Customer wants a unit asap.');

		expect(describePriorityReason(opportunity)).toBe('Customer mentioned a timeline: "asap".');
	});

	it('explains medium priority by noting no timeline was mentioned', () => {
		const opportunity = analyzeTranscript('Customer is asking about pricing.');

		expect(describePriorityReason(opportunity)).toBe('No timeline mentioned yet.');
	});
});
