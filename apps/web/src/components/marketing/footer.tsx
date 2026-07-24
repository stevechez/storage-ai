export function Footer() {
	return (
		<footer className="border-t border-steel/20 bg-concrete px-6 py-12 sm:px-10 lg:px-16">
			<div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="font-display text-lg font-bold text-ink">StorageAI</p>
					<p className="mt-1 text-sm text-steel">
						A digital leasing manager for independent self-storage facilities.
					</p>
				</div>

				<nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-steel">
					<a href="#how-it-works" className="hover:text-ink">
						How it works
					</a>
					<a href="#early-access" className="hover:text-ink">
						Early access
					</a>
					<a href="#early-access" className="hover:text-ink">
						Contact the founder
					</a>
				</nav>
			</div>

			<p className="mx-auto mt-10 max-w-6xl text-xs text-steel/70">
				© {new Date().getFullYear()} StorageAI. Built for the operators who answer their own phones.
			</p>
		</footer>
	);
}
