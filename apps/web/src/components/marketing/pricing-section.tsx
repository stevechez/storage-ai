const FOUNDER_PROGRAM_FEATURES = [
	'Setup assistance',
	'Direct founder access',
	'Help evaluating missed call opportunities',
	'Locked-in founder pricing',
] as const;

const SUCCESS_QUESTIONS = [
	'How many calls did we analyze?',
	'How many renters showed interest?',
	'How many follow-ups were identified?',
	'Were there opportunities you would have missed?',
] as const;

export function PricingSection() {
	return (
		<section id="pricing" className="border-t border-steel/20 bg-concrete px-6 py-24 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-4xl text-center">
				<p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">First 20 facilities only</p>
				<h2 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
					A founder pilot, not just a free trial.
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-lg text-steel">
					This isn&apos;t &quot;try the software for a month.&quot; It&apos;s a chance to find out,
					with direct help from the person building it, whether IntelliLease actually surfaces rental
					opportunities you&apos;d otherwise miss — before you commit to anything long-term.
				</p>

				<div className="mt-12 grid gap-6 text-left sm:grid-cols-2">
					<div className="rounded-2xl border-2 border-signal bg-white p-8">
						<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Founder program</p>
						<p className="mt-3 font-display text-4xl font-black text-ink">
							$99<span className="text-lg font-normal text-steel"> first month</span>
						</p>
						<p className="mt-1 text-sm font-semibold text-signal">then $199/mo, founder pricing locked in</p>

						<ul className="mt-6 space-y-2 text-sm text-steel">
							{FOUNDER_PROGRAM_FEATURES.map(feature => (
								<li key={feature} className="flex items-center gap-2">
									<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
									{feature}
								</li>
							))}
						</ul>

						<a
							href="#early-access"
							className="mt-8 block rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-concrete transition-colors hover:bg-signal"
						>
							Apply for the founder program
						</a>
					</div>

					<div className="rounded-2xl border border-steel/20 bg-white p-8">
						<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Multi-facility operators</p>
						<p className="mt-3 font-display text-4xl font-black text-ink">Contact us</p>
						<p className="mt-1 text-sm text-steel">For operators managing multiple locations</p>

						<p className="mt-6 text-sm text-steel">
							Pricing for multiple facilities depends on how many locations you run and how they&apos;re
							currently staffed. Reach out and we&apos;ll work out something fair together.
						</p>

						<a
							href="#early-access"
							className="mt-8 block rounded-full border border-ink px-6 py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-concrete"
						>
							Talk to us
						</a>
					</div>
				</div>

				<div className="mx-auto mt-10 max-w-xl rounded-2xl border border-steel/20 bg-white p-8 text-left">
					<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Your first month</p>
					<p className="mt-3 font-semibold text-ink">During your first month, we&apos;ll help you answer:</p>
					<ul className="mt-4 space-y-2 text-sm text-steel">
						{SUCCESS_QUESTIONS.map(question => (
							<li key={question} className="flex items-center gap-2">
								<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
								{question}
							</li>
						))}
					</ul>
					<p className="mt-4 text-sm text-steel">
						If the answers don&apos;t show real value, don&apos;t continue. That&apos;s the point of a
						pilot.
					</p>
				</div>

				<p className="mx-auto mt-10 max-w-xl text-sm text-steel">
					One missed rental can represent thousands of dollars in lifetime revenue. IntelliLease is
					designed to help operators capture opportunities they never knew they lost.
				</p>
			</div>
		</section>
	);
}
