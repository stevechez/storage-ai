function SkeletonBlock({ className = '' }: { className?: string }) {
	return <div className={`animate-pulse rounded-md bg-gray-100 ${className}`} />;
}

export default function DashboardLoading() {
	return (
		<main className="max-w-5xl mx-auto p-8">
			<SkeletonBlock className="h-9 w-64 mb-3" />
			<SkeletonBlock className="h-5 w-80 mb-10" />

			<div className="border rounded-lg p-5 mb-10">
				<SkeletonBlock className="h-24 w-full" />
			</div>

			<SkeletonBlock className="h-7 w-40 mb-4" />
			<div className="space-y-4 mb-10">
				<SkeletonBlock className="h-20 w-full" />
				<SkeletonBlock className="h-20 w-full" />
			</div>

			<SkeletonBlock className="h-7 w-40 mb-4" />
			<SkeletonBlock className="h-32 w-full mb-10" />
		</main>
	);
}
