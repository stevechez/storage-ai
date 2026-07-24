const STEPS = [
	{
		number: '01',
		title: 'Capture',
		description: 'Every call is understood for what the renter actually wants — even the ones that come in after you\'ve locked up.',
	},
	{
		number: '02',
		title: 'Prioritize',
		description: 'Each opportunity gets a priority and a recommended next step, so you know who to call back first.',
	},
	{
		number: '03',
		title: 'Respond',
		description: 'A ready-to-send reply is drafted for you to review and send yourself — nothing goes out automatically.',
	},
	{
		number: '04',
		title: 'Measure',
		description: 'See what converted, what\'s still pending, and the monthly revenue those opportunities represent.',
	},
] as const;

export function HowItWorks() {
	return (
		<section id="how-it-works" className="bg-concrete px-6 py-28 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-6xl">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">How it works</p>
				<h2 className="mt-4 max-w-xl font-display text-4xl font-black tracking-tight text-ink">
					One workflow, from ringing phone to rented unit.
				</h2>

				<div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
					{STEPS.map(step => (
						<div key={step.number} className="border-t-2 border-ink pt-5">
							<span className="font-mono text-sm text-signal">{step.number}</span>
							<h3 className="mt-3 font-display text-xl font-bold text-ink">{step.title}</h3>
							<p className="mt-2 text-sm text-steel">{step.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
