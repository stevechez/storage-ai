import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_FACILITY_ID } from './constants';
import type { Facility } from '@/types/storage';

export async function getCurrentFacility(facilityId: string = DEMO_FACILITY_ID): Promise<Facility> {
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
