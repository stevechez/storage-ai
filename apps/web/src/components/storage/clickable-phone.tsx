import { formatPhoneNumber } from '@/lib/storage/format';

export function ClickablePhone({ phone }: { phone: string | null }) {
	if (!phone) {
		return <>{formatPhoneNumber(phone)}</>;
	}

	return (
		<a href={`tel:${phone}`} className="hover:underline">
			{formatPhoneNumber(phone)}
		</a>
	);
}
