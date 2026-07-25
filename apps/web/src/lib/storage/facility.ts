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

// Phase 41: resolves an inbound call to the facility it belongs to via the
// number Vapi reports as called, instead of a hardcoded facility ID. Returns
// null (not an error) when no facility is configured for that number, so
// callers can decide how to handle an unmapped number.
export async function getFacilityByPhoneNumber(phoneNumber: string): Promise<Facility | null> {
	const supabase = createAdminClient();

	const { data: facility, error } = await supabase
		.from('facilities')
		.select('*')
		.eq('twilio_phone_number', phoneNumber)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return facility;
}
