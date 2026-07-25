export interface Facility {
	id: string;
	organization_id: string | null;
	name: string;
	address: string | null;
	city: string | null;
	state: string | null;
	timezone: string | null;
	pms_provider: string | null;
	pms_facility_id: string | null;
	phone: string | null;
	contact_name: string | null;
	contact_email: string | null;
	created_at: string;
}
