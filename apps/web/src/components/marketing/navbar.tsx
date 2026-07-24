export function Navbar() {
	return (
		<nav className="sticky top-0 z-10 flex items-center justify-between border-b border-steel/10 bg-concrete/90 px-6 py-5 backdrop-blur sm:px-10 lg:px-16">
			<div className="font-display text-lg font-black tracking-tight text-ink">StorageAI</div>

			<div className="hidden items-center gap-8 text-sm font-medium text-steel sm:flex">
				<a href="#how-it-works" className="hover:text-ink">
					How it works
				</a>
				<a href="#benefits" className="hover:text-ink">
					Benefits
				</a>
			</div>

			<a
				href="#early-access"
				className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-concrete transition-colors hover:bg-signal"
			>
				Join early access
			</a>
		</nav>
	);
}
