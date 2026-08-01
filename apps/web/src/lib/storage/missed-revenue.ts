export interface MissedRevenueEstimate {
	monthlyRevenueLost: number;
	annualRevenueLost: number;
}

export function estimateLostRevenue({
	likelyRenters,
	avgMonthlyRate,
}: {
	likelyRenters: number;
	avgMonthlyRate: number;
}): MissedRevenueEstimate {
	const monthlyRevenueLost = likelyRenters * avgMonthlyRate;

	return {
		monthlyRevenueLost,
		annualRevenueLost: monthlyRevenueLost * 12,
	};
}
