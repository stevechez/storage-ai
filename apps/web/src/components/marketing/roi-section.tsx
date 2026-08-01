'use client';

import { useActionState, useState } from 'react';
import { submitMissedRevenueLead, type FormState } from '@/app/actions';
import { estimateLostRevenue } from '@/lib/storage/missed-revenue';
import { formatEstimatedRevenue } from '@/lib/storage/revenue';

const BIGGEST_CHALLENGES = [
	'Missed after-hours calls',
	'Staffing',
	'Too many phone calls',
	'Vacancies',
	'Other',
] as const;

const initialState: FormState = { status: 'idle' };

export function RoiSection() {
	const [missedCallsPerMonth, setMissedCallsPerMonth] = useState(8);
	const [likelyRenters, setLikelyRenters] = useState(3);
	const [avgMonthlyRate, setAvgMonthlyRate] = useState(180);
	const [state, formAction, isPending] = useActionState(submitMissedRevenueLead, initialState);

	const { monthlyRevenueLost, annualRevenueLost } = estimateLostRevenue({ likelyRenters, avgMonthlyRate });

	return (
		<section className="border-t border-steel/20 bg-white px-6 py-24 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-3xl text-center">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">What does this cost me?</p>
				<h2 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
					How Much Revenue Are Missed Calls Costing You?
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-lg text-steel">
					Answer three questions about your facility and see the estimate instantly.
				</p>

				<p className="mx-auto mt-6 max-w-lg text-sm text-steel">
					Most independent facilities start with these numbers — adjust if yours are different.
				</p>

				<div className="mx-auto mt-4 max-w-lg rounded-2xl border border-steel/20 bg-concrete/40 p-8 text-left">
					<div className="grid gap-4 sm:grid-cols-3">
						<NumberField
							label="Missed calls / mo"
							value={missedCallsPerMonth}
							onChange={setMissedCallsPerMonth}
						/>
						<NumberField label="Likely renters" value={likelyRenters} onChange={setLikelyRenters} />
						<NumberField
							label="Avg. rate / unit"
							value={avgMonthlyRate}
							onChange={setAvgMonthlyRate}
							prefix="$"
						/>
					</div>

					<p className="mt-6 text-sm text-steel">
						{missedCallsPerMonth} missed calls → {likelyRenters} likely renters × {formatEstimatedRevenue(avgMonthlyRate)}/mo
					</p>
					<p className="mt-2 font-mono text-2xl font-bold text-ink">
						{formatEstimatedRevenue(monthlyRevenueLost)}<span className="text-base font-normal text-steel">/mo</span>
					</p>
					<p className="mt-1 font-display text-3xl font-black text-signal">
						{formatEstimatedRevenue(annualRevenueLost)}/year
					</p>
					<p className="mt-3 text-sm text-steel">in estimated lost revenue.</p>
				</div>

				<div className="mx-auto mt-8 max-w-lg rounded-2xl border border-steel/20 bg-white p-8 text-left">
					<p className="font-semibold text-ink">Want a more accurate number for your exact facility?</p>
					<p className="mt-1 text-sm text-steel">
						Tell us a bit more and we&apos;ll walk through the real numbers together — no
						automated email, just a conversation.
					</p>

					{state.status === 'success' ? (
						<p className="mt-6 rounded-xl border border-signal/40 bg-signal/10 px-6 py-5 text-sm font-semibold text-ink">
							{state.message}
						</p>
					) : (
						<form action={formAction} className="mt-6 space-y-4">
							<input type="hidden" name="missedCallsPerMonth" value={missedCallsPerMonth} />
							<input type="hidden" name="likelyRenters" value={likelyRenters} />
							<input type="hidden" name="avgMonthlyRate" value={avgMonthlyRate} />

							<div className="grid gap-4 sm:grid-cols-2">
								<TextField label="Name" name="name" required />
								<TextField label="Email" name="email" type="email" required />
							</div>
							<TextField label="Facility name" name="facilityName" />

							<label className="block text-xs tracking-wide text-steel uppercase">
								Biggest challenge
								<select
									name="biggestChallenge"
									defaultValue={BIGGEST_CHALLENGES[0]}
									className="mt-1.5 w-full rounded-lg border border-steel/20 bg-white px-4 py-2.5 text-sm normal-case text-ink focus:border-signal focus:outline-none"
								>
									{BIGGEST_CHALLENGES.map(challenge => (
										<option key={challenge} value={challenge}>
											{challenge}
										</option>
									))}
								</select>
							</label>

							{state.status === 'error' ? <p className="text-sm text-signal">{state.message}</p> : null}

							<button
								type="submit"
								disabled={isPending}
								className="w-full rounded-full bg-ink px-7 py-3 text-sm font-semibold text-concrete transition-colors hover:bg-signal disabled:opacity-60"
							>
								{isPending ? 'Sending…' : 'Estimate My Lost Rentals'}
							</button>
						</form>
					)}
				</div>
			</div>
		</section>
	);
}

function NumberField({
	label,
	value,
	onChange,
	prefix,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	prefix?: string;
}) {
	return (
		<label className="block text-xs tracking-wide text-steel uppercase">
			{label}
			<div className="mt-1.5 flex items-center rounded-lg border border-steel/20 bg-white px-3 py-2.5 focus-within:border-signal">
				{prefix ? <span className="text-sm text-steel">{prefix}</span> : null}
				<input
					type="number"
					min={0}
					value={value}
					onChange={event => onChange(Number(event.target.value) || 0)}
					className="w-full bg-transparent text-sm normal-case text-ink focus:outline-none"
				/>
			</div>
		</label>
	);
}

function TextField({
	label,
	name,
	type = 'text',
	required = false,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
}) {
	return (
		<label className="block text-xs tracking-wide text-steel uppercase">
			{label}
			<input
				name={name}
				type={type}
				required={required}
				className="mt-1.5 w-full rounded-lg border border-steel/20 bg-white px-4 py-2.5 text-sm normal-case text-ink placeholder:text-steel/40 focus:border-signal focus:outline-none"
			/>
		</label>
	);
}
