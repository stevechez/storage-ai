export function ProblemSection() {
	return (
		<section className="relative bg-dusk px-6 py-28 text-concrete sm:px-10 lg:px-16">
			<div
				className="pointer-events-none absolute inset-0 opacity-40"
				style={{
					backgroundImage:
						'repeating-linear-gradient(180deg, transparent, transparent 39px, var(--color-dusk-line) 40px)',
				}}
				aria-hidden="true"
			/>

			<div className="relative mx-auto max-w-3xl text-center">
				<div className="flex items-center justify-center gap-2">
					<span className="h-2 w-2 rounded-full bg-lamp" aria-hidden="true" />
					<p className="font-mono text-xs tracking-[0.2em] text-lamp uppercase">The office closed at 6</p>
				</div>

				<h2 className="mt-8 font-display text-4xl leading-tight font-black tracking-tight sm:text-5xl">
					A renter calls at 9pm. It rings.
					<br />
					Nobody answers. They call the next facility.
				</h2>

				<p className="mx-auto mt-8 max-w-xl text-lg text-concrete/70">
					You never see that call as a loss — it just never shows up as anything. No missed-call
					badge on a revenue report. No unit rented. It&apos;s the rental you didn&apos;t know you
					lost, and it happens every week that phone isn&apos;t answered by someone who can say yes.
				</p>
			</div>
		</section>
	);
}
