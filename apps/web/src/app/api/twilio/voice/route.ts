import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { logTelephonyEvent, parseTwilioVoiceParams } from '@/lib/telephony/events';

const GREETING = 'Thank you for calling StorageAI. This system is currently under founder testing.';

function buildGreetingTwiml(): string {
	const response = new twilio.twiml.VoiceResponse();
	response.say(GREETING);
	return response.toString();
}

function twimlResponse() {
	return new NextResponse(buildGreetingTwiml(), {
		status: 200,
		headers: { 'Content-Type': 'text/xml' },
	});
}

export async function POST(request: Request) {
	const formData = await request.formData();
	const params = Object.fromEntries(formData.entries()) as Record<string, string>;

	if (process.env.NODE_ENV === 'production') {
		const authToken = process.env.TWILIO_AUTH_TOKEN;
		const signature = request.headers.get('x-twilio-signature');

		if (!authToken || !signature || !twilio.validateRequest(authToken, signature, request.url, params)) {
			console.error('Rejected Twilio webhook: missing or invalid signature');
			return new NextResponse('Forbidden', { status: 403 });
		}
	} else {
		console.warn('Twilio signature validation skipped — NODE_ENV is not "production"');
	}

	if (!params.CallSid) {
		console.error('Twilio webhook missing CallSid — not a real call event', params);
		return twimlResponse();
	}

	try {
		await logTelephonyEvent(parseTwilioVoiceParams(params));
	} catch (error) {
		console.error('Failed to log telephony event', error);
	}

	return twimlResponse();
}
