import type { MorningReport as MorningReportData } from '@/types/leasing';
import { OpportunitySummary } from './opportunity-summary';
import { OpportunityCard } from './opportunity-card';

export function MorningReport({ report }: { report: MorningReportData }) {
	return (
		<section className="mb-10">
			<h2 className="text-2xl font-semibold mb-4">Morning Brief</h2>

			<OpportunitySummary report={report} />

			<h3 className="text-lg font-semibold mt-8 mb-4">Today&apos;s First Call</h3>

			{report.recommendedFollowUp ? (
				<OpportunityCard opportunity={report.recommendedFollowUp} />
			) : (
				<div className="border rounded-lg p-5 text-gray-500">No urgent follow-ups today.</div>
			)}
		</section>
	);
}
