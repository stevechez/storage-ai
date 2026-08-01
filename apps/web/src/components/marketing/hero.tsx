export function Hero() {
	return (
		<section className="relative overflow-hidden bg-concrete px-6 pt-20 pb-28 sm:px-10 lg:px-16">
			<div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
				<div>
					<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">
						For independent self-storage operators
					</p>

					<h1 className="mt-6 font-display text-5xl leading-[1.05] font-black tracking-tight text-ink sm:text-6xl">
						Capture more rentals —
						<br />
						<span className="text-signal">without hiring another employee.</span>
					</h1>

					<div className="mt-6 max-w-md space-y-1 text-xl font-semibold text-ink">
						<p>Wake up knowing every after-hours caller got an answer.</p>
						<p>Your highest-priority callbacks are already waiting.</p>
					</div>

					<p className="mt-4 max-w-md text-lg text-steel">
						Your digital leasing manager answers every call, qualifies renters, and makes sure
						nothing falls through the cracks while you&apos;re busy running the property.
					</p>

					<div className="mt-8 space-y-2 text-sm text-steel">
						<p>
							✓ Every call answered, logged, and summarized — escalated to you if the assistant
							isn&apos;t confident.
						</p>
						<p>
							<span className="font-semibold text-ink">Live this afternoon.</span> Your next missed
							call could become your next rental.
						</p>
						<p>
							<span className="font-semibold text-ink">Forward your number. Send your price sheet. Done.</span>
						</p>
					</div>

					<div className="mt-10 flex flex-wrap items-center gap-6">
						<a
							href="#early-access"
							className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-concrete transition-colors hover:bg-signal"
						>
							Request Founder Pilot
						</a>
						<a href="#how-it-works" className="text-sm font-medium text-ink underline decoration-steel/40 underline-offset-4 hover:decoration-signal">
							See how it works
						</a>
					</div>
				</div>

				<CallTransformation />
			</div>
		</section>
	);
}

function CallTransformation() {
	return (
		<div className="mx-auto w-full max-w-sm">
			<p className="text-center font-mono text-xs tracking-[0.2em] text-steel uppercase lg:text-left">
				While you&apos;re home for the night
			</p>

			<div className="mt-4 rounded-2xl border border-steel/20 bg-white p-6 shadow-xl shadow-ink/5">
				<div className="flex items-center gap-2">
					<span className="relative flex h-2.5 w-2.5">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal/60" />
						<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
					</span>
					<p className="font-mono text-xs tracking-wide text-steel uppercase">9:42 PM · Missed Call</p>
				</div>
				<p className="mt-6 text-2xl font-semibold text-ink">&quot;Need a 10x15, ASAP.&quot;</p>
				<p className="mt-3 text-sm text-steel">Nobody was at the desk. The renter hung up not knowing if anyone heard them.</p>
			</div>

			<div className="flex flex-col items-center gap-1 py-3" aria-hidden="true">
				<span className="text-lg text-signal">↓</span>
				<span className="font-mono text-[11px] tracking-[0.15em] text-steel uppercase">Answered — you don&apos;t lift a finger.</span>
			</div>

			<div className="rounded-2xl bg-ink p-6 text-concrete shadow-xl shadow-ink/10">
				<p className="font-mono text-xs tracking-wide text-lamp uppercase">Your next move</p>
				<p className="mt-6 text-2xl font-semibold">Call back — 10x15 unit</p>
				<dl className="mt-4 space-y-1 text-sm text-concrete/70">
					<div className="flex justify-between">
						<dt>Timeline</dt>
						<dd className="text-concrete">ASAP</dd>
					</div>
					<div className="flex justify-between">
						<dt>Priority</dt>
						<dd className="font-semibold text-signal">High</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
