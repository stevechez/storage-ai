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
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
			<p className="text-xs tracking-wide text-gray-500 uppercase">Dashboard unavailable</p>
			<h1 className="text-2xl font-bold">We couldn&apos;t load your facility data.</h1>
			<p className="max-w-md text-gray-500">
				This has been logged. Try again — if it keeps happening, that&apos;s worth telling us about.
			</p>
			<button
				onClick={reset}
				className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
			>
				Try again
			</button>
		</main>
	);
}
