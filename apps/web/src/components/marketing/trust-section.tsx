const CERTAINTY_POINTS = [
	'Every call gets answered — day or night.',
	'Nothing said on the phone gets lost or forgotten.',
	'You start every morning with your highest-value follow-ups already prioritized.',
	"If we're ever not confident, the call comes straight to you — not a guess.",
] as const;

export function TrustSection() {
	return (
		<section id="early-stage" className="bg-concrete px-6 py-24 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-3xl text-center">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Is this real?</p>
				<h2 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
					Every call. Accounted for.
				</h2>

				<ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
					{CERTAINTY_POINTS.map((point, index) => {
						const isLast = index === CERTAINTY_POINTS.length - 1;
						return (
							<li
								key={point}
								className={`flex items-start gap-3 text-lg ${isLast ? 'font-semibold text-ink' : 'text-ink'}`}
							>
								<span className="mt-0.5 font-semibold text-signal" aria-hidden="true">
									✓
								</span>
								{point}
							</li>
						);
					})}
				</ul>

				<p className="mt-10 text-lg text-steel">
					Built specifically for independent storage operators. IntelliLease is currently working
					directly with a small number of early facilities to eliminate missed rental
					opportunities — not selling to everyone at once, and not pretending otherwise.
				</p>
				<p className="mt-4 text-steel">
					You won&apos;t find customer logos or case studies here yet, because there aren&apos;t
					any to show honestly.
				</p>

				<div className="mx-auto mt-8 max-w-md rounded-2xl border border-steel/20 bg-white p-6 text-left">
					<div className="flex items-center gap-4">
						<div
							className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xl font-bold text-concrete"
							aria-hidden="true"
						>
							S
						</div>
						<div>
							<p className="font-semibold text-ink">Steve</p>
							<p className="text-sm text-steel">Founder</p>
						</div>
					</div>
					<p className="mt-4 text-sm text-steel">
						Hi, I&apos;m Steve. I built IntelliLease because too many independent storage owners
						lose rentals simply because nobody can answer every call after hours.
					</p>
					<p className="mt-3 text-sm text-steel">
						During the Founder Pilot you&apos;ll work directly with me. We&apos;ll review your
						calls together and decide whether IntelliLease is actually creating value for your
						facility.
					</p>
					<p className="mt-3 text-sm font-semibold text-ink">If it isn&apos;t, I&apos;ll tell you.</p>
				</div>
			</div>
		</section>
	);
}
