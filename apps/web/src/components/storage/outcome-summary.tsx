import type { OutcomeSummary as OutcomeSummaryData } from '@/types/leasing';

export function OutcomeSummary({ summary }: { summary: OutcomeSummaryData }) {
	const identified = summary.pending + summary.converted + summary.lost;

	return (
		<div className="border rounded-lg p-5">
			<div className="text-sm text-gray-500 mb-2">Conversion Summary</div>

			<p className="text-sm">
				<span className="font-semibold">{identified}</span> opportunities identified ·{' '}
				<span className="font-semibold">{summary.converted}</span> converted ·{' '}
				<span className="font-semibold">{summary.lost}</span> lost ·{' '}
				<span className="font-semibold">{summary.pending}</span> pending
			</p>
		</div>
	);
}
