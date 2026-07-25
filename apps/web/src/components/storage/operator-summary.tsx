import { Card } from './card';

export function OperatorSummary({
	highPriorityCount,
	needsFollowUpCount,
	convertedRecentCount,
}: {
	highPriorityCount: number;
	needsFollowUpCount: number;
	convertedRecentCount: number;
}) {
	return (
		<Card>
			<div className="text-sm text-gray-500 mb-2">Today&apos;s Leasing Activity</div>

			<div className="space-y-1 text-sm">
				<div>
					<span className="font-semibold">{highPriorityCount}</span> High Priority Opportunit
					{highPriorityCount === 1 ? 'y' : 'ies'}
				</div>

				<div>
					<span className="font-semibold">{needsFollowUpCount}</span> Customer
					{needsFollowUpCount === 1 ? '' : 's'} Need Follow-Up
				</div>

				<div>
					<span className="font-semibold">{convertedRecentCount}</span> Rental
					{convertedRecentCount === 1 ? '' : 's'} Converted Recently
				</div>
			</div>
		</Card>
	);
}
