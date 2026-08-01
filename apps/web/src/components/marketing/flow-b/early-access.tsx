'use client';

import { useActionState } from 'react';
import { submitFlowBFounderSignup, type FlowBFormState } from '@/app/flow-b/actions';

const initialState: FlowBFormState = { status: 'idle' };

export function EarlyAccess() {
	const [state, formAction, isPending] = useActionState(submitFlowBFounderSignup, initialState);

	return (
		<section id="early-access" className="bg-ink px-6 py-28 text-concrete sm:px-10 lg:px-16">
			<div className="mx-auto max-w-xl text-center">
				<p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">Get early access</p>
				<h2 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
					Live this afternoon. No new hire required.
				</h2>
				<p className="mt-4 text-concrete/70">
					Tell us about your facility and we&apos;ll reach out — no sales pitch, just a real
					conversation about whether this fits how you run things.
				</p>

				{state.status === 'success' ? (
					<p className="mt-10 rounded-xl border border-signal/40 bg-signal/10 px-6 py-5 text-lg font-semibold text-concrete">
						{state.message}
					</p>
				) : (
					<form action={formAction} className="mt-10 space-y-4 text-left">
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Name" name="name" required />
							<Field label="Email" name="email" type="email" required />
						</div>
						<Field label="Facility name" name="facilityName" />
						<Field label="Anything you want us to know" name="message" as="textarea" />

						{state.status === 'error' ? <p className="text-sm text-signal">{state.message}</p> : null}

						<button
							type="submit"
							disabled={isPending}
							className="w-full rounded-full bg-signal px-7 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lamp disabled:opacity-60"
						>
							{isPending ? 'Sending…' : 'Request early access'}
						</button>
					</form>
				)}
			</div>
		</section>
	);
}

function Field({
	label,
	name,
	type = 'text',
	as = 'input',
	required = false,
}: {
	label: string;
	name: string;
	type?: string;
	as?: 'input' | 'textarea';
	required?: boolean;
}) {
	const fieldClassName =
		'w-full rounded-lg border border-concrete/20 bg-concrete/5 px-4 py-2.5 text-sm text-concrete placeholder:text-concrete/40 focus:border-signal focus:outline-none';

	return (
		<label className="block text-xs tracking-wide text-concrete/60 uppercase">
			{label}
			{as === 'textarea' ? (
				<textarea name={name} rows={3} className={`mt-1.5 normal-case ${fieldClassName}`} />
			) : (
				<input name={name} type={type} required={required} className={`mt-1.5 normal-case ${fieldClassName}`} />
			)}
		</label>
	);
}
