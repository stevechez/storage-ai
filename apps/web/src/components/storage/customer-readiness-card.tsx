import { Card } from './card';
import { formatPhoneNumber } from '@/lib/storage/format';

// Phase 45: kept simple and local rather than a new shared utility — this is the
// only place relative time is needed on the dashboard so far.
function formatRelativeTime(iso: string): string {
	const diffMs = Date.now() - new Date(iso).getTime();
	const minutes = Math.round(diffMs / 60000);
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	const days = Math.round(hours / 24);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function CustomerReadinessCard({
	phoneNumber,
	phoneConnected,
	callsRecently,
	activeOpportunities,
	lastCallAt,
}: {
	phoneNumber: string | null;
	phoneConnected: boolean;
	callsRecently: number;
	activeOpportunities: number;
	lastCallAt: string | null;
}) {
	return (
		<Card className="mb-10">
			<div className="text-sm text-gray-500 mb-4">AI Leasing Assistant</div>

			<div className="flex items-center gap-2 mb-4">
				<span className={`inline-block h-2.5 w-2.5 rounded-full ${phoneConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
				<span className="text-sm font-medium">{phoneConnected ? 'Online' : 'Not yet connected'}</span>
			</div>

			<div className="grid grid-cols-3 gap-6 mb-4">
				<div>
					<div className="text-xs text-gray-500 mb-1">Phone Number</div>
					<div className="text-sm font-medium">
						{phoneNumber ? formatPhoneNumber(phoneNumber) : 'Not yet assigned'}
					</div>
				</div>
				<div>
					<div className="text-xs text-gray-500 mb-1">Calls (Last 24h)</div>
					<div className="text-sm font-medium">{callsRecently}</div>
				</div>
				<div>
					<div className="text-xs text-gray-500 mb-1">Active Opportunities</div>
					<div className="text-sm font-medium">{activeOpportunities}</div>
				</div>
			</div>

			<p className="text-sm text-gray-500">
				{lastCallAt
					? `Last call received ${formatRelativeTime(lastCallAt)}.`
					: phoneConnected
						? 'Your assistant is ready for its first customer.'
						: 'Your workspace is set up — telephony is still being connected.'}
			</p>
		</Card>
	);
}
