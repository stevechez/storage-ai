import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_FACILITY_ID } from './constants';

export async function getCurrentFacility() {
	const supabase = createAdminClient();

	const { data: facility, error } = await supabase
		.from('facilities')
		.select('*')
		.eq('id', DEMO_FACILITY_ID)
		.single();

	if (error) {
		throw error;
	}

	return facility;
}
