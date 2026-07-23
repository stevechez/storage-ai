import type { MorningReport } from '@/types/leasing';

export function OpportunitySummary({
	report,
}: {
	report: Pick<MorningReport, 'highPriorityCount' | 'rentalRequests' | 'pricingQuestions' | 'availabilityRequests'>;
}) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div className="border rounded-lg p-5">
				<div className="text-sm text-gray-500">🔥 High Priority</div>

				<div className="text-3xl font-bold">{report.highPriorityCount}</div>
			</div>

			<div className="border rounded-lg p-5">
				<div className="text-sm text-gray-500">Rental Requests</div>

				<div className="text-3xl font-bold">{report.rentalRequests}</div>
			</div>

			<div className="border rounded-lg p-5">
				<div className="text-sm text-gray-500">Pricing Questions</div>

				<div className="text-3xl font-bold">{report.pricingQuestions}</div>
			</div>

			<div className="border rounded-lg p-5">
				<div className="text-sm text-gray-500">Availability Requests</div>

				<div className="text-3xl font-bold">{report.availabilityRequests}</div>
			</div>
		</div>
	);
}
