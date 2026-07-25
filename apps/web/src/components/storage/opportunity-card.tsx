import type { LeasingOpportunity, OpportunityIntent, OpportunityPriority } from '@/types/leasing';
import { describePriorityReason } from '@/lib/storage/intelligence';
import { Card } from './card';

const INTENT_LABEL: Record<OpportunityIntent, string> = {
	rental: 'Wants to rent a unit',
	pricing: 'Asking about pricing',
	availability: 'Checking availability',
	general: 'General inquiry',
};

const PRIORITY_LABEL: Record<OpportunityPriority, string> = {
	high: 'High',
	medium: 'Medium',
	low: 'Low',
};

const PRIORITY_COLOR: Record<OpportunityPriority, string> = {
	high: 'text-red-600',
	medium: 'text-amber-600',
	low: 'text-gray-500',
};

export function OpportunityCard({
	opportunity,
	actionLabel = 'Recommended Action',
}: {
	opportunity: LeasingOpportunity;
	actionLabel?: string;
}) {
	return (
		<Card>
			<div className="text-sm text-gray-500">Rental Opportunity</div>

			<div className="mt-3 space-y-2">
				<div>
					<div className="text-sm text-gray-500">Customer Need</div>
					<div className="font-semibold">{INTENT_LABEL[opportunity.intent]}</div>
				</div>

				<div>
					<div className="text-sm text-gray-500">Unit Size</div>
					<div className="font-semibold">{opportunity.unitSize ?? 'Not specified'}</div>
				</div>

				<div>
					<div className="text-sm text-gray-500">Timeline</div>
					<div className="font-semibold">{opportunity.timeline ?? 'Not specified'}</div>
				</div>

				<div>
					<div className="text-sm text-gray-500">Priority</div>
					<div className={`font-semibold ${PRIORITY_COLOR[opportunity.priority]}`}>
						{PRIORITY_LABEL[opportunity.priority]}
					</div>
					<div className="text-xs text-gray-400">{describePriorityReason(opportunity)}</div>
				</div>

				<div>
					<div className="text-sm text-gray-500">{actionLabel}</div>
					<div className="font-semibold">{opportunity.recommendedAction}</div>
				</div>
			</div>

			<div className="mt-4 text-xs text-gray-400">
				Based on an automatic read of the call — always confirm details with the customer.
			</div>
		</Card>
	);
}
