export function DemoBanner({ facilityName }: { facilityName: string }) {
	return (
		<div className="border border-amber-200 bg-amber-50 text-amber-900 rounded-lg px-4 py-2 text-sm mb-6">
			This is a live demonstration using sample leasing activity for {facilityName} — illustrating how
			IntelliLease works on a real facility&apos;s calls.
		</div>
	);
}
