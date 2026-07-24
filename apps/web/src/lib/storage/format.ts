const US_E164_PATTERN = /^\+1(\d{3})(\d{3})(\d{4})$/;

export function formatPhoneNumber(phone: string | null): string {
	if (!phone) return 'Unknown caller';

	const match = phone.match(US_E164_PATTERN);
	if (!match) return phone;

	const [, areaCode, prefix, lineNumber] = match;
	return `(${areaCode}) ${prefix}-${lineNumber}`;
}
