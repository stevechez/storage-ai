import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_FACILITY_ID } from './constants';

export async function getCurrentFacility(facilityId: string = DEMO_FACILITY_ID) {
	const supabase = createAdminClient();

	const { data: facility, error } = await supabase
		.from('facilities')
		.select('*')
		.eq('id', facilityId)
		.single();

	if (error) {
		throw error;
	}

	return facility;
}
