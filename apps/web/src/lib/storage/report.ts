import { createAdminClient } from '@/lib/supabase/admin';

export async function getMorningReport(facilityId: string) {
	const supabase = createAdminClient();

	const { data: calls, error } = await supabase
		.from('calls')
		.select('*')
		.eq('facility_id', facilityId)
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	const totalCalls = calls.length;

	const interested = calls.filter(c => c.outcome === 'interested').length;

	const pricing = calls.filter(c => c.outcome === 'pricing').length;

	const followUps = calls.filter(c => c.outcome === 'interested').length;

	return {
		totalCalls,
		interested,
		pricing,
		followUps,
		recentCalls: calls,
	};
}
