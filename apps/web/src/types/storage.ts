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
