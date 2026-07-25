import type { OperatorAction } from '@/types/leasing';
import { OpportunityCard } from './opportunity-card';
import { ClickablePhone } from './clickable-phone';

export function OperatorActions({ actions }: { actions: OperatorAction[] }) {
	if (actions.length === 0) {
		return (
			<div className="border rounded-lg p-5 text-gray-500">
				Nothing needs attention right now — StorageAI is watching every call as it comes in.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{actions.map(action => (
				<div key={action.callId} className="space-y-2">
					<div className="font-semibold">
						<ClickablePhone phone={action.callerPhone} />
					</div>

					<OpportunityCard opportunity={action.opportunity} actionLabel="Suggested Next Step" />
				</div>
			))}
		</div>
	);
}
