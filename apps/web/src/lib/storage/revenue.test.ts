import { describe, expect, it } from 'vitest';
import { ASSUMED_MONTHLY_RATE, estimateRevenueImpact, formatEstimatedRevenue } from './revenue';
import type { FollowUp } from '@/types/leasing';

function followUp(status: FollowUp['status']): FollowUp {
	return {
		callId: `call-${status}-${Math.random()}`,
		callerPhone: null,
		status,
		createdAt: '2026-07-23T12:00:00.000Z',
		opportunity: {
			intent: 'rental',
			priority: 'medium',
			recommendedAction: 'Follow up with renter',
		},
	};
}

describe('estimateRevenueImpact', () => {
	it('estimates monthly revenue from converted and pending opportunities, excluding lost ones', () => {
		const followUps: FollowUp[] = [
			followUp('new'),
			followUp('contacted'),
			followUp('contacted'),
			followUp('converted'),
			followUp('lost'),
		];

		const impact = estimateRevenueImpact(followUps, 135);

		expect(impact).toEqual({
			identifiedCount: 4,
			convertedCount: 1,
			pendingCount: 3,
			assumedMonthlyRate: 135,
			estimatedMonthlyRevenue: 540,
			estimatedCapturedRevenue: 135,
		});
	});

	it('returns all zeros for an empty list', () => {
		const impact = estimateRevenueImpact([], 135);

		expect(impact).toEqual({
			identifiedCount: 0,
			convertedCount: 0,
			pendingCount: 0,
			assumedMonthlyRate: 135,
			estimatedMonthlyRevenue: 0,
			estimatedCapturedRevenue: 0,
		});
	});

	it('defaults to the standard assumed monthly rate when none is provided', () => {
		const impact = estimateRevenueImpact([followUp('converted')]);

		expect(impact.assumedMonthlyRate).toBe(ASSUMED_MONTHLY_RATE);
		expect(impact.estimatedMonthlyRevenue).toBe(ASSUMED_MONTHLY_RATE);
	});
});

describe('formatEstimatedRevenue', () => {
	it('prefixes the amount with an approximation symbol', () => {
		expect(formatEstimatedRevenue(540)).toBe('≈ $540');
	});

	it('adds thousands separators for larger amounts', () => {
		expect(formatEstimatedRevenue(1234)).toBe('≈ $1,234');
	});

	it('formats zero the same way as any other amount', () => {
		expect(formatEstimatedRevenue(0)).toBe('≈ $0');
	});
});
