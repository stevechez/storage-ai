import { getCurrentFacility } from '@/lib/storage/facility';
import { getMorningReport } from '@/lib/storage/report';
import { getFollowUps } from '@/lib/storage/follow-up';
import { summarizeOutcomes } from '@/lib/storage/outcomes';
import { MorningReport } from '@/components/storage/morning-report';
import { LeasingQueue } from '@/components/storage/leasing-queue';
import { OutcomeSummary } from '@/components/storage/outcome-summary';

export default async function DashboardPage() {
	const facility = await getCurrentFacility();

	const [report, followUps] = await Promise.all([
		getMorningReport(facility.id),
		getFollowUps(facility.id),
	]);

	return (
		<main className="max-w-5xl mx-auto p-8">
			<h1 className="text-4xl font-bold">{facility.name}</h1>

			<p className="text-gray-500 mb-10">StorageAI Operator Dashboard</p>

			<MorningReport report={report} />

			<div className="mb-10">
				<OutcomeSummary summary={summarizeOutcomes(followUps)} />
			</div>

			<h2 className="text-2xl font-semibold mb-4">Leasing Queue</h2>

			<LeasingQueue followUps={followUps} />
		</main>
	);
}
