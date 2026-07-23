import { describe, expect, it } from 'vitest';
import { summarizeOpportunities } from './report';
import type { LeasingOpportunity } from '@/types/leasing';

function opportunity(overrides: Partial<LeasingOpportunity>): LeasingOpportunity {
	return {
		intent: 'general',
		priority: 'medium',
		recommendedAction: 'Follow up with renter',
		...overrides,
	};
}

describe('summarizeOpportunities', () => {
	it('counts opportunities by priority and intent, and recommends the first high-priority call', () => {
		const opportunities: LeasingOpportunity[] = [
			opportunity({ intent: 'rental', priority: 'high', unitSize: '10x10', timeline: 'this weekend' }),
			opportunity({ intent: 'rental', priority: 'medium' }),
			opportunity({ intent: 'rental', priority: 'medium' }),
			opportunity({ intent: 'rental', priority: 'high' }),
			opportunity({ intent: 'pricing', priority: 'medium' }),
			opportunity({ intent: 'pricing', priority: 'low' }),
			opportunity({ intent: 'pricing', priority: 'medium' }),
			opportunity({ intent: 'availability', priority: 'low' }),
			opportunity({ intent: 'availability', priority: 'medium' }),
		];

		const report = summarizeOpportunities(opportunities);

		expect(report.highPriorityCount).toBe(2);
		expect(report.mediumPriorityCount).toBe(5);
		expect(report.rentalRequests).toBe(4);
		expect(report.pricingQuestions).toBe(3);
		expect(report.availabilityRequests).toBe(2);
		expect(report.recommendedFollowUp).toEqual({
			intent: 'rental',
			priority: 'high',
			unitSize: '10x10',
			timeline: 'this weekend',
			recommendedAction: 'Call customer immediately.',
		});
	});

	it('returns null recommendedFollowUp when there are no opportunities', () => {
		const report = summarizeOpportunities([]);

		expect(report.recommendedFollowUp).toBeNull();
		expect(report.highPriorityCount).toBe(0);
	});

	it('recommends the highest-priority opportunity when none are high priority', () => {
		const opportunities: LeasingOpportunity[] = [
			opportunity({ intent: 'availability', priority: 'low' }),
			opportunity({ intent: 'pricing', priority: 'medium' }),
		];

		const report = summarizeOpportunities(opportunities);

		expect(report.recommendedFollowUp?.intent).toBe('pricing');
		expect(report.recommendedFollowUp?.recommendedAction).toBe('Follow up today.');
	});
});
