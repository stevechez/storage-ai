'use client';

import { useActionState } from 'react';
import { updateFollowUpStatusAction, type UpdateStatusFormState } from '@/app/dashboard/actions';
import type { OpportunityStatus } from '@/types/leasing';

const STATUS_ACTIONS: { status: OpportunityStatus; label: string }[] = [
	{ status: 'contacted', label: 'Mark Contacted' },
	{ status: 'converted', label: 'Mark Converted' },
	{ status: 'lost', label: 'Mark Lost' },
];

const initialState: UpdateStatusFormState = { status: 'idle' };

export function FollowUpStatusForm({
	callId,
	currentStatus,
}: {
	callId: string;
	currentStatus: OpportunityStatus;
}) {
	const [state, formAction] = useActionState(updateFollowUpStatusAction, initialState);

	return (
		<form action={formAction} className="flex flex-wrap items-center gap-2">
			<input type="hidden" name="callId" value={callId} />

			{STATUS_ACTIONS.filter(action => action.status !== currentStatus).map(action => (
				<button
					key={action.status}
					name="status"
					value={action.status}
					className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50"
				>
					{action.label}
				</button>
			))}

			{state.status === 'error' ? <span className="text-sm text-red-600">{state.message}</span> : null}
		</form>
	);
}
