const BENEFITS = [
	{
		title: 'Recover missed rental opportunities.',
		description: 'Calls that would have gone unanswered — nights, weekends, busy front desks — still turn into a follow-up you can act on.',
	},
	{
		title: 'Never lose track of an interested renter.',
		description: 'Every opportunity has a status: new, contacted, converted, or lost. Nothing quietly falls off your radar.',
	},
	{
		title: 'Know who needs follow-up first.',
		description: 'Opportunities are ranked by priority, so the most time-sensitive renter is always at the top of your list.',
	},
	{
		title: 'Measure the revenue impact of every opportunity.',
		description: 'See an honest, clearly-labeled estimate of what your identified and converted opportunities are worth.',
	},
] as const;

export function BenefitsSection() {
	return (
		<section id="benefits" className="border-t border-steel/20 bg-white px-6 py-28 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-6xl">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Why it matters</p>
				<h2 className="mt-4 max-w-xl font-display text-4xl font-black tracking-tight text-ink">
					Built around what actually costs you rentals.
				</h2>

				<div className="mt-16 grid gap-10 sm:grid-cols-2">
					{BENEFITS.map(benefit => (
						<div key={benefit.title} className="rounded-2xl border border-steel/20 bg-concrete/40 p-8">
							<h3 className="font-display text-xl font-bold text-ink">{benefit.title}</h3>
							<p className="mt-3 text-sm text-steel">{benefit.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
