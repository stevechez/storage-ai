export function DemoBanner({ facilityName }: { facilityName: string }) {
	return (
		<div className="border border-amber-200 bg-amber-50 text-amber-900 rounded-lg px-4 py-2 text-sm mb-6">
			Demo Facility — this shows sample leasing activity for {facilityName}, illustrating how StorageAI
			works on a real facility&apos;s calls.
		</div>
	);
}
