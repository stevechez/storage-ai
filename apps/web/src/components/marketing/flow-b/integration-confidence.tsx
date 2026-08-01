const ONBOARDING_STEPS = [
	{
		number: '01',
		title: 'Forward your number.',
		description: 'Point your existing line to IntelliLease — nothing to install, no new hardware.',
	},
	{
		number: '02',
		title: 'Send your price sheet.',
		description: 'We set up your assistant to quote real availability and pricing from day one.',
	},
	{
		number: '03',
		title: 'Done.',
		description: "You're live. Every call gets answered, logged, and summarized.",
	},
] as const;

export function IntegrationConfidence() {
	return (
		<section id="how-it-fits" className="border-t border-steel/20 bg-white px-6 py-24 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-4xl text-center">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Will this disrupt my operation?</p>
				<h2 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
					Everything else becomes our job.
				</h2>

				<div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
					{ONBOARDING_STEPS.map(step => (
						<div key={step.number} className="rounded-2xl border border-steel/20 bg-concrete/40 p-6">
							<p className="font-mono text-sm text-signal">{step.number}</p>
							<p className="mt-3 font-display text-xl font-bold text-ink">{step.title}</p>
							<p className="mt-2 text-sm text-steel">{step.description}</p>
						</div>
					))}
				</div>

				<p className="mx-auto mt-10 max-w-xl text-sm text-steel">
					Works alongside the property management software you already use — SiteLink, storEDGE,
					and others — with direct integrations prioritized based on what early operators actually
					need.
				</p>
			</div>
		</section>
	);
}
