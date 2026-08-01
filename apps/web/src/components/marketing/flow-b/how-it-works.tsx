function StepEyebrow({ number, title }: { number: string; title: string }) {
	return (
		<div className="flex items-center gap-3">
			<span className="font-mono text-sm text-signal">{number}</span>
			<h3 className="font-display text-xl font-bold text-ink">{title}</h3>
		</div>
	);
}

function Connector() {
	return (
		<div className="flex justify-center py-2 lg:justify-start lg:pl-[1.15rem]" aria-hidden="true">
			<span className="text-lg text-steel/40">↓</span>
		</div>
	);
}

export function HowItWorks() {
	return (
		<section id="how-it-works" className="bg-concrete px-6 py-28 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-3xl">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">See what happens</p>
				<h2 className="mt-4 font-display text-4xl font-black tracking-tight text-ink">
					See what happens after a renter calls.
				</h2>
				<p className="mt-3 text-lg text-steel">One phone call. Zero extra hires.</p>

				<div className="mt-16 space-y-2">
					{/* Step 1 — the call comes in */}
					<div>
						<StepEyebrow number="01" title="A renter calls your facility." />
						<div className="mt-4 ml-9 rounded-2xl border border-steel/20 bg-white p-5">
							<div className="flex items-center gap-2">
								<span className="relative flex h-2.5 w-2.5">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal/60" />
									<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
								</span>
								<p className="font-mono text-xs tracking-wide text-steel uppercase">Incoming call</p>
							</div>
							<p className="mt-4 text-lg text-ink">
								&quot;Hi, I&apos;m looking for a 10×10 unit next weekend.&quot;
							</p>
						</div>
					</div>

					<Connector />

					{/* Step 2 — the assistant answers */}
					<div>
						<StepEyebrow number="02" title="IntelliLease answers instantly." />
						<div className="mt-4 ml-9 space-y-2 rounded-2xl border border-steel/20 bg-white p-5">
							<p className="text-sm text-steel">
								<span className="font-mono text-xs tracking-wide text-signal uppercase">Assistant</span>
								<br />
								&quot;Happy to help — what size unit, and when do you need it?&quot;
							</p>
							<p className="text-sm text-ink">
								<span className="font-mono text-xs tracking-wide text-steel uppercase">Renter</span>
								<br />
								&quot;A 10×10, some time this weekend.&quot;
							</p>
						</div>
					</div>

					<Connector />

					{/* Step 3 — real fields from the actual OpportunityCard (components/storage/opportunity-card.tsx) */}
					<div>
						<StepEyebrow number="03" title="The conversation appears in your dashboard." />
						<div className="mt-4 ml-9 rounded-2xl border border-steel/20 bg-white p-5">
							<p className="font-mono text-xs tracking-wide text-steel uppercase">Rental Opportunity</p>
							<dl className="mt-3 space-y-2 text-sm">
								<div>
									<dt className="text-steel">Customer Need</dt>
									<dd className="font-semibold text-ink">Wants to rent a unit</dd>
								</div>
								<div>
									<dt className="text-steel">Unit Size</dt>
									<dd className="font-semibold text-ink">10×10</dd>
								</div>
								<div>
									<dt className="text-steel">Timeline</dt>
									<dd className="font-semibold text-ink">This weekend</dd>
								</div>
								<div>
									<dt className="text-steel">Priority</dt>
									<dd className="font-semibold text-signal">High</dd>
								</div>
								<div>
									<dt className="text-steel">Recommended Action</dt>
									<dd className="font-semibold text-ink">Call customer immediately.</dd>
								</div>
							</dl>
						</div>
					</div>

					<Connector />

					{/* Step 4 — the outcome */}
					<div>
						<StepEyebrow number="04" title="You follow up and rent the unit." />
						<div className="mt-4 ml-9 rounded-2xl bg-ink p-5 text-concrete">
							<p className="font-mono text-xs tracking-wide text-lamp uppercase">Status: Converted</p>
							<p className="mt-3 text-sm text-concrete/80">
								Called back within the hour. Renter signed for the 10×10 unit, moving in this weekend.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
