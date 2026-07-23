import { getCurrentFacility } from '@/lib/storage/facility';
import { getMorningReport } from '@/lib/storage/report';

export default async function DashboardPage() {
	const facility = await getCurrentFacility();

	const report = await getMorningReport(facility.id);

	return (
		<main className="max-w-5xl mx-auto p-8">
			<h1 className="text-4xl font-bold">{facility.name}</h1>

			<p className="text-gray-500 mb-10">StorageAI Operator Dashboard</p>

			<section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
				<div className="border rounded-lg p-5">
					<div className="text-sm text-gray-500">Calls Answered</div>

					<div className="text-3xl font-bold">{report.totalCalls}</div>
				</div>

				<div className="border rounded-lg p-5">
					<div className="text-sm text-gray-500">Interested Renters</div>

					<div className="text-3xl font-bold">{report.interested}</div>
				</div>

				<div className="border rounded-lg p-5">
					<div className="text-sm text-gray-500">Pricing Questions</div>

					<div className="text-3xl font-bold">{report.pricing}</div>
				</div>

				<div className="border rounded-lg p-5">
					<div className="text-sm text-gray-500">Follow Ups</div>

					<div className="text-3xl font-bold">{report.followUps}</div>
				</div>
			</section>

			<h2 className="text-2xl font-semibold mb-4">Recent Calls</h2>

			<div className="space-y-4">
				{report.recentCalls.map(call => (
					<div key={call.id} className="border rounded-lg p-4">
						<div className="font-semibold">{call.caller_phone}</div>

						<div>{call.outcome}</div>

						<div className="text-sm text-gray-500 mt-2">{call.transcript}</div>
					</div>
				))}
			</div>
		</main>
	);
}
