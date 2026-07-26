import { getCurrentFacility } from '@/lib/storage/facility';
import { DEMO_FACILITY_ID } from '@/lib/storage/constants';
import { summarizeOpportunities } from '@/lib/storage/report';
import { getFollowUps } from '@/lib/storage/follow-up';
import { getTodaysActions } from '@/lib/storage/actions';
import { summarizeRecentOutcomes } from '@/lib/storage/outcomes';
import { estimateRevenueImpact } from '@/lib/storage/revenue';
import { LeasingQueue } from '@/components/storage/leasing-queue';
import { OutcomeSummary } from '@/components/storage/outcome-summary';
import { OperatorSummary } from '@/components/storage/operator-summary';
import { OperatorActions } from '@/components/storage/operator-actions';
import { OpportunitySummary } from '@/components/storage/opportunity-summary';
import { DemoBanner } from '@/components/storage/demo-banner';
import { RevenueImpactCard } from '@/components/storage/revenue-impact-card';
import { LogCallForm } from '@/components/storage/log-call-form';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ facility?: string }>;
}) {
	const { facility: facilityId } = await searchParams;
	const resolvedFacilityId = facilityId ?? DEMO_FACILITY_ID;

	const [facility, followUps] = await Promise.all([
		getCurrentFacility(resolvedFacilityId),
		getFollowUps(resolvedFacilityId),
	]);

	const todaysActions = getTodaysActions(followUps);
	const recentOutcomes = summarizeRecentOutcomes(followUps);
	const report = summarizeOpportunities(todaysActions.map(action => action.opportunity));

	const activitySummary =
		todaysActions.length === 0
			? 'No rental opportunities need attention right now.'
			: `${todaysActions.length} rental opportunit${todaysActions.length === 1 ? 'y' : 'ies'} need${
					todaysActions.length === 1 ? 's' : ''
				} attention today.`;

	return (
		<main className="max-w-5xl mx-auto p-8">
			{facility.id === DEMO_FACILITY_ID ? <DemoBanner facilityName={facility.name} /> : null}

			<h1 className="text-4xl font-bold">{facility.name}</h1>

			<p className="text-gray-500 mb-10">{activitySummary}</p>

			{/* Phase 44a verification only — remove once workspace_type is used for real behavior (Phase 44b+) */}
			<p className="text-xs text-gray-300 mb-6">Workspace: {facility.workspace_type}</p>

			<section className="mb-10">
				<LogCallForm facilityId={facility.id} />
			</section>

			<section className="mb-10">
				<h2 className="text-2xl font-semibold mb-4">Good Morning</h2>

				<div className="space-y-4">
					<OperatorSummary
						highPriorityCount={todaysActions.filter(action => action.opportunity.priority === 'high').length}
						needsFollowUpCount={todaysActions.length}
						convertedRecentCount={recentOutcomes.converted}
					/>

					<OpportunitySummary report={report} />
				</div>
			</section>

			<section className="mb-10">
				<h2 className="text-2xl font-semibold mb-4">Today&apos;s Actions</h2>

				<OperatorActions actions={todaysActions} />
			</section>

			<section className="mb-10">
				<h2 className="text-2xl font-semibold mb-4">Active Opportunities</h2>

				<LeasingQueue followUps={followUps} />
			</section>

			<section className="mb-10">
				<h2 className="text-2xl font-semibold mb-4">Recent Results</h2>

				<OutcomeSummary summary={recentOutcomes} title="Last 24 Hours" />
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-4">Revenue Impact</h2>

				<RevenueImpactCard impact={estimateRevenueImpact(followUps)} />
			</section>
		</main>
	);
}
