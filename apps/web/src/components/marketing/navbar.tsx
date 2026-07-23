export function Navbar() {
	return (
		<nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
			<div className="text-xl font-semibold tracking-tight">StorageAI</div>

			<a
				href="#early-access"
				className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
			>
				Join Early Access
			</a>
		</nav>
	);
}
