// Phase 44c: replaces the old alert-style DemoBanner. Deliberately tasteful, not a
// developer-sounding warning — the demo workspace is a sales asset (Salesforce/Stripe-style
// demo environments are clearly labeled, but never look like an error state). Kept as a real,
// visible disclosure rather than removed entirely: a forwarded screenshot, recording, or link
// should never be mistaken for a real customer's live operation.
export function DemoBadge() {
	return (
		<div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 mb-6">
			<span className="text-xs font-medium text-gray-600">Demo Workspace</span>
			<span className="text-xs text-gray-400">·</span>
			<span className="text-xs text-gray-500">Sample leasing activity for demonstration purposes</span>
		</div>
	);
}
