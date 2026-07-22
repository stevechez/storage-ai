import { createAdminClient } from '@/lib/supabase/admin';

const FACILITY_ID = '11111111-1111-1111-1111-111111111111';

export async function getMorningReport() {
	const supabase = createAdminClient();

	const { data: calls } = await supabase
		.from('calls')
		.select('*')
		.eq('facility_id', FACILITY_ID)
		.order('created_at', { ascending: false });

	const interested = calls?.filter(c => c.outcome === 'interested').length ?? 0;

	const pricing = calls?.filter(c => c.outcome === 'pricing').length ?? 0;

	return {
		totalCalls: calls?.length ?? 0,

		interested,

		pricing,

		calls: calls ?? [],
	};
}
