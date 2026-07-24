import type { FollowUp, OpportunityStatus } from '@/types/leasing';
import { OpportunityCard } from './opportunity-card';
import { OpportunityStatusBadge } from './opportunity-status-badge';
import { ResponseDraftCard } from './response-draft-card';
import { updateFollowUpStatusAction } from '@/app/dashboard/actions';
import { generateResponseDraft } from '@/lib/storage/responses';
import { formatPhoneNumber } from '@/lib/storage/format';

const STATUS_ACTIONS: { status: OpportunityStatus; label: string }[] = [
	{ status: 'contacted', label: 'Mark Contacted' },
	{ status: 'converted', label: 'Mark Converted' },
	{ status: 'lost', label: 'Mark Lost' },
];

export function LeasingQueue({ followUps }: { followUps: FollowUp[] }) {
	if (followUps.length === 0) {
		return (
			<div className="border rounded-lg p-5 text-gray-500">
				No leasing opportunities yet. As soon as a customer calls, StorageAI will capture it here.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{followUps.map(followUp => (
				<div key={followUp.callId} className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="font-semibold">{formatPhoneNumber(followUp.callerPhone)}</div>

						<OpportunityStatusBadge status={followUp.status} />
					</div>

					<OpportunityCard opportunity={followUp.opportunity} />

					<ResponseDraftCard draft={generateResponseDraft(followUp)} />

					<form className="flex gap-2">
						<input type="hidden" name="callId" value={followUp.callId} />

						{STATUS_ACTIONS.filter(action => action.status !== followUp.status).map(action => (
							<button
								key={action.status}
								formAction={updateFollowUpStatusAction}
								name="status"
								value={action.status}
								className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50"
							>
								{action.label}
							</button>
						))}
					</form>
				</div>
			))}
		</div>
	);
}
