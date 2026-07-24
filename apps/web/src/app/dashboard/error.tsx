'use client';

import { useEffect } from 'react';

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-concrete px-6 text-center">
			<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Dashboard unavailable</p>
			<h1 className="font-display text-2xl font-black text-ink">We couldn&apos;t load your facility data.</h1>
			<p className="max-w-md text-steel">
				This has been logged. Try again — if it keeps happening, that&apos;s worth telling us about.
			</p>
			<button
				onClick={reset}
				className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-concrete transition-colors hover:bg-signal"
			>
				Try again
			</button>
		</main>
	);
}
