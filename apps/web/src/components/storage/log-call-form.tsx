'use client';

import { useActionState } from 'react';
import { logCallAction, type LogCallFormState } from '@/app/dashboard/actions';
import { Card } from './card';

const initialState: LogCallFormState = { status: 'idle' };

export function LogCallForm({ facilityId }: { facilityId: string }) {
	const [state, formAction, isPending] = useActionState(logCallAction, initialState);

	return (
		<Card>
			<div className="text-sm text-gray-500 mb-1">Log a Call</div>
			<p className="text-sm text-gray-500 mb-4">
				No phone system connected yet — until there is, log a call here and it runs through the same
				analysis as everything else on this page.
			</p>

			<form action={formAction} className="space-y-3">
				<input type="hidden" name="facilityId" value={facilityId} />

				<div>
					<label className="block text-xs text-gray-500 mb-1" htmlFor="log-call-caller">
						Caller phone number
					</label>
					<input
						id="log-call-caller"
						name="caller"
						type="tel"
						required
						placeholder="+1 555 555 0100"
						className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
					/>
				</div>

				<div>
					<label className="block text-xs text-gray-500 mb-1" htmlFor="log-call-transcript">
						What did they need? (optional, but this is what gets analyzed)
					</label>
					<textarea
						id="log-call-transcript"
						name="transcript"
						rows={3}
						placeholder="Customer wants a 10x10 unit this weekend, asked about pricing."
						className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
					/>
				</div>

				{state.status === 'error' ? <p className="text-sm text-red-600">{state.message}</p> : null}
				{state.status === 'success' ? <p className="text-sm text-green-600">{state.message}</p> : null}

				<button
					type="submit"
					disabled={isPending}
					className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
				>
					{isPending ? 'Logging…' : 'Log call'}
				</button>
			</form>
		</Card>
	);
}
