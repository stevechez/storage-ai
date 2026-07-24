export function RoiSection() {
	return (
		<section className="border-t border-steel/20 bg-white px-6 py-24 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-3xl text-center">
				<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">What does this cost me?</p>
				<h2 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
					One missed renter costs more than a subscription.
				</h2>

				<div className="mx-auto mt-8 max-w-sm rounded-2xl border border-steel/20 bg-concrete/40 p-8 text-left">
					<p className="text-sm text-steel">One renter you never called back:</p>
					<p className="mt-2 font-mono text-2xl font-bold text-ink">
						$100<span className="text-base font-normal text-steel">/mo</span> × 24 months
					</p>
					<p className="mt-1 font-display text-3xl font-black text-signal">= $2,400</p>
					<p className="mt-3 text-sm text-steel">in lost revenue from one unanswered call.</p>
				</div>

				<p className="mx-auto mt-8 max-w-xl text-lg text-steel">
					Recovering even one additional rental easily justifies trying this. The question isn&apos;t
					really what StorageAI costs — it&apos;s what a missed call already costs you, whether you
					notice it or not.
				</p>
			</div>
		</section>
	);
}
