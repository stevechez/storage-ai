import { describe, expect, it } from 'vitest';
import { parseTwilioVoiceParams } from './events';

describe('parseTwilioVoiceParams', () => {
	it('maps Twilio webhook params to a telephony event', () => {
		const params = {
			CallSid: 'CA1234567890abcdef1234567890abcdef',
			From: '+15125550110',
			To: '+15125559999',
			Direction: 'inbound',
			CallStatus: 'ringing',
		};

		expect(parseTwilioVoiceParams(params)).toEqual({
			callSid: 'CA1234567890abcdef1234567890abcdef',
			fromNumber: '+15125550110',
			toNumber: '+15125559999',
			direction: 'inbound',
			callStatus: 'ringing',
		});
	});

	it('maps missing optional fields to null', () => {
		const params = { CallSid: 'CA1234567890abcdef1234567890abcdef' };

		expect(parseTwilioVoiceParams(params)).toEqual({
			callSid: 'CA1234567890abcdef1234567890abcdef',
			fromNumber: null,
			toNumber: null,
			direction: null,
			callStatus: null,
		});
	});
});
