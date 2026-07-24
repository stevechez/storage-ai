import type { FollowUp, RevenueImpact } from '@/types/leasing';
import { summarizeOutcomes } from './outcomes';

export const ASSUMED_MONTHLY_RATE = 135;

export function estimateRevenueImpact(
	followUps: FollowUp[],
	monthlyRate: number = ASSUMED_MONTHLY_RATE,
): RevenueImpact {
	const { converted, pending } = summarizeOutcomes(followUps);
	const identifiedCount = converted + pending;

	return {
		identifiedCount,
		convertedCount: converted,
		pendingCount: pending,
		assumedMonthlyRate: monthlyRate,
		estimatedMonthlyRevenue: identifiedCount * monthlyRate,
		estimatedCapturedRevenue: converted * monthlyRate,
	};
}

export function formatEstimatedRevenue(amount: number): string {
	return `≈ $${amount.toLocaleString('en-US')}`;
}
