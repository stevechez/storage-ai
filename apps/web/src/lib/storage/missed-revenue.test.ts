import { describe, expect, it } from 'vitest';
import { estimateLostRevenue } from './missed-revenue';

describe('estimateLostRevenue', () => {
	it('matches the worked example (8 missed calls, 3 likely renters, $180/mo)', () => {
		const estimate = estimateLostRevenue({ likelyRenters: 3, avgMonthlyRate: 180 });

		expect(estimate).toEqual({
			monthlyRevenueLost: 540,
			annualRevenueLost: 6480,
		});
	});

	it('returns zero when no renters would have been likely', () => {
		const estimate = estimateLostRevenue({ likelyRenters: 0, avgMonthlyRate: 180 });

		expect(estimate).toEqual({
			monthlyRevenueLost: 0,
			annualRevenueLost: 0,
		});
	});

	it('generalizes to other input combinations', () => {
		const estimate = estimateLostRevenue({ likelyRenters: 5, avgMonthlyRate: 150 });

		expect(estimate).toEqual({
			monthlyRevenueLost: 750,
			annualRevenueLost: 9000,
		});
	});
});
