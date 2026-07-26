import { Card } from './card';

export function CustomerReadinessCard({
	phoneNumber,
	phoneConnected,
}: {
	phoneNumber: string | null;
	phoneConnected: boolean;
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
					<div className="text-sm font-medium">{phoneNumber ?? 'Not yet assigned'}</div>
				</div>
				<div>
					<div className="text-xs text-gray-500 mb-1">Today&apos;s Calls</div>
					<div className="text-sm font-medium">0</div>
				</div>
				<div>
					<div className="text-xs text-gray-500 mb-1">Opportunities</div>
					<div className="text-sm font-medium">0</div>
				</div>
			</div>

			<p className="text-sm text-gray-500">
				{phoneConnected
					? "Your assistant is ready for its first customer."
					: 'Your workspace is set up — telephony is still being connected.'}
			</p>
		</Card>
	);
}
