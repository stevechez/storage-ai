export function Hero() {
	return (
		<section className="relative overflow-hidden bg-concrete px-6 pt-20 pb-28 sm:px-10 lg:px-16">
			<div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
				<div>
					<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">
						For independent self-storage operators
					</p>

					<h1 className="mt-6 font-display text-5xl leading-[1.05] font-black tracking-tight text-ink sm:text-6xl">
						Missed calls become
						<br />
						<span className="text-signal">recovered rentals.</span>
					</h1>

					<p className="mt-6 max-w-md text-lg text-steel">
						StorageAI listens to every call your facility gets, figures out what the renter
						needs, and tells you exactly who to follow up with first — even the ones that came
						in after you locked up for the night.
					</p>

					<div className="mt-10 flex flex-wrap items-center gap-6">
						<a
							href="#early-access"
							className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-concrete transition-colors hover:bg-signal"
						>
							Get early access
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
		<div className="relative mx-auto w-full max-w-sm">
			<div className="absolute -inset-4 rounded-3xl bg-ink/5" aria-hidden="true" />
			<div className="relative h-64 rounded-2xl border border-steel/20 bg-white shadow-xl shadow-ink/5">
				<div className="absolute inset-0 animate-[card-fade-a_8s_ease-in-out_infinite] rounded-2xl bg-white p-6">
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

				<div className="absolute inset-0 animate-[card-fade-b_8s_ease-in-out_infinite] rounded-2xl bg-ink p-6 text-concrete">
					<p className="font-mono text-xs tracking-wide text-lamp uppercase">Recommended Action</p>
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
		</div>
	);
}
