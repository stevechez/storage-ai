const TIMELINE = [
	{
		label: 'Tonight',
		title: 'Every after-hours caller gets an answer.',
		description: 'No voicemail. No hoping they call back.',
	},
	{
		label: 'Tomorrow Morning',
		title: 'You know exactly who wants a unit.',
		description: 'Your follow-up list is already prioritized.',
	},
	{
		label: 'Next Month',
		title: 'You know whether IntelliLease is paying for itself.',
		description: 'Real numbers, not a guess.',
	},
] as const;

export function TomorrowSection() {
	return (
		<section className="border-t border-steel/20 bg-white px-6 py-24 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-4xl text-center">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">The timeline</p>
				<h2 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
					What changes tomorrow?
				</h2>

				<div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
					{TIMELINE.map(item => (
						<div key={item.label} className="rounded-2xl border border-steel/20 bg-concrete/40 p-6">
							<p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">{item.label}</p>
							<p className="mt-3 font-display text-xl font-bold text-ink">{item.title}</p>
							<p className="mt-2 text-sm text-steel">{item.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
