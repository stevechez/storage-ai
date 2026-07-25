import type { MorningReport } from '@/types/leasing';
import { Card } from './card';

export function OpportunitySummary({
	report,
}: {
	report: Pick<MorningReport, 'rentalRequests' | 'pricingQuestions' | 'availabilityRequests'>;
}) {
	return (
		<div className="grid grid-cols-3 gap-4">
			<Card>
				<div className="text-sm text-gray-500">Rental Requests</div>

				<div className="text-3xl font-bold">{report.rentalRequests}</div>
			</Card>

			<Card>
				<div className="text-sm text-gray-500">Pricing Questions</div>

				<div className="text-3xl font-bold">{report.pricingQuestions}</div>
			</Card>

			<Card>
				<div className="text-sm text-gray-500">Availability Requests</div>

				<div className="text-3xl font-bold">{report.availabilityRequests}</div>
			</Card>
		</div>
	);
}
