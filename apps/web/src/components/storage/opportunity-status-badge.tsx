import type { OpportunityStatus } from '@/types/leasing';

const STATUS_LABEL: Record<OpportunityStatus, string> = {
	new: 'Needs Follow-Up',
	contacted: 'Contacted',
	converted: 'Converted ✅',
	lost: 'Lost ❌',
};

const STATUS_COLOR: Record<OpportunityStatus, string> = {
	new: 'text-red-600',
	contacted: 'text-amber-600',
	converted: 'text-green-600',
	lost: 'text-gray-500',
};

export function OpportunityStatusBadge({ status }: { status: OpportunityStatus }) {
	return <span className={`text-sm font-semibold ${STATUS_COLOR[status]}`}>{STATUS_LABEL[status]}</span>;
}
