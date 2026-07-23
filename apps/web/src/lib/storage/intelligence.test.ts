import { describe, expect, it } from 'vitest';
import { analyzeTranscript } from './intelligence';

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
