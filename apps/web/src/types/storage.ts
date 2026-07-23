export type LeadStatus =
    | "new"
    | "contacted"
    | "reserved"
    | "leased"
    | "lost";


export interface Lead {

    id: string;

    facility_id: string;

    name?: string;

    phone: string;

    email?: string;

    unit_interest?: string;

    status: LeadStatus;

    created_at: string;

}

export interface Facility {

	id: string;

	name: string;

	address?: string | null;

	city?: string | null;

	state?: string | null;

	pms_provider?: string | null;

	pms_facility_id?: string | null;

	created_at: string;

}
