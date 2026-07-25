import type { FollowUp } from '@/types/leasing';
import { OpportunityCard } from './opportunity-card';
import { OpportunityStatusBadge } from './opportunity-status-badge';
import { ResponseDraftCard } from './response-draft-card';
import { FollowUpStatusForm } from './follow-up-status-form';
import { ClickablePhone } from './clickable-phone';
import { Card } from './card';
import { generateResponseDraft } from '@/lib/storage/responses';

export function LeasingQueue({ followUps }: { followUps: FollowUp[] }) {
	if (followUps.length === 0) {
		return (
			<Card className="text-gray-500">
				No leasing opportunities yet. As soon as a customer calls, StorageAI will capture it here.
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{followUps.map(followUp => (
				<div key={followUp.callId} className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="font-semibold">
							<ClickablePhone phone={followUp.callerPhone} />
						</div>

						<OpportunityStatusBadge status={followUp.status} />
					</div>

					<OpportunityCard opportunity={followUp.opportunity} />

					<ResponseDraftCard draft={generateResponseDraft(followUp)} />

					<FollowUpStatusForm callId={followUp.callId} currentStatus={followUp.status} />
				</div>
			))}
		</div>
	);
}
