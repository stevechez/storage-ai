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
