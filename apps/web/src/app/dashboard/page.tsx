import { createAdminClient } from '@/lib/supabase/admin';

const FACILITY_ID = '11111111-1111-1111-1111-111111111111';

export default async function DashboardPage() {
	const supabase = createAdminClient();

	const { data: calls } = await supabase
		.from('calls')
		.select('*')
		.eq('facility_id', FACILITY_ID)
		.order('created_at', { ascending: false });

	return (
		<main className="max-w-5xl mx-auto p-8">
			<h1 className="text-4xl font-bold mb-2">StorageAI</h1>

			<p className="text-gray-500 mb-10">Operator Dashboard</p>

			<div className="mb-10">
				<div className="text-sm text-gray-500">Calls Answered</div>

				<div className="text-5xl font-bold">{calls?.length ?? 0}</div>
			</div>

			<h2 className="text-2xl font-semibold mb-4">Recent Calls</h2>

			<div className="space-y-4">
				{calls?.map(call => (
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
