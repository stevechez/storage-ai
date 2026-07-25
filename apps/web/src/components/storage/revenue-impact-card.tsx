import type { RevenueImpact } from '@/types/leasing';
import { formatEstimatedRevenue } from '@/lib/storage/revenue';
import { Card } from './card';

export function RevenueImpactCard({ impact }: { impact: RevenueImpact }) {
	return (
		<Card>
			<div className="text-3xl font-bold">{formatEstimatedRevenue(impact.estimatedMonthlyRevenue)}</div>
			<div className="text-sm text-gray-500 mb-4">Estimated Monthly Revenue</div>

			<div className="space-y-1 text-sm mb-4">
				<div>
					{impact.identifiedCount} Opportunit{impact.identifiedCount === 1 ? 'y' : 'ies'} Identified
				</div>
				<div>{impact.convertedCount} Converted</div>
				<div>{impact.pendingCount} Pending</div>
				<div>{formatEstimatedRevenue(impact.estimatedCapturedRevenue)} already captured from converted rentals</div>
			</div>

			<div className="text-xs text-gray-400">
				Estimated using an assumed ${impact.assumedMonthlyRate}/month average unit rate — not real billing data.
			</div>
		</Card>
	);
}
