import { describe, expect, it } from 'vitest';
import { formatPhoneNumber } from './format';

describe('formatPhoneNumber', () => {
	it('formats a US E.164 number as (XXX) XXX-XXXX', () => {
		expect(formatPhoneNumber('+15125550110')).toBe('(512) 555-0110');
	});

	it('falls back to the raw value for numbers it does not recognize', () => {
		expect(formatPhoneNumber('+44123456789')).toBe('+44123456789');
	});

	it('falls back to "Unknown caller" when there is no phone number', () => {
		expect(formatPhoneNumber(null)).toBe('Unknown caller');
	});
});
