#!/usr/bin/env node
// Creates the first StorageAI Vapi assistant and imports the existing
// Twilio pilot number into it, so inbound calls to that number are
// answered by Vapi instead of the static /api/twilio/voice greeting
// (Phase 39 Task 1 + Task 2).
//
// Usage (run from apps/web, so module resolution + relative paths work):
//
//   cd apps/web
//   node scripts/setup-vapi-assistant.mjs
//
// Credentials: reads apps/web/.env.production.local, which must define
// VAPI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and
// TWILIO_FROM_NUMBER — same file scripts/onboard-facility.mjs already
// uses for production tooling credentials, never auto-loaded by
// `next dev`.
//
// This is a one-time setup script, not idempotent by design: running it
// twice creates a second assistant and re-imports the number onto it.
// If re-running deliberately (e.g. after deleting the old assistant),
// that's expected; otherwise don't re-run without a reason.

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(webRoot, '.env.production.local');

function loadEnv(filePath) {
	if (!existsSync(filePath)) {
		console.error(`Missing ${filePath}`);
		console.error('Create it with VAPI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.');
		process.exit(1);
	}

	const env = {};
	for (const line of readFileSync(filePath, 'utf8').split('\n')) {
		const match = line.match(/^([A-Z_]+)=(.*)$/);
		if (match) env[match[1]] = match[2].trim().replace(/^"(.*)"$/, '$1');
	}
	return env;
}

const env = loadEnv(envPath);
const { VAPI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = env;

for (const [name, value] of Object.entries({
	VAPI_API_KEY,
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_FROM_NUMBER,
})) {
	if (!value) {
		console.error(`${envPath} must define ${name}`);
		process.exit(1);
	}
}

const webhookSecret = randomBytes(32).toString('hex');
const webhookUrl = 'https://storage-ai-sigma.vercel.app/api/vapi/webhook';

const SYSTEM_PROMPT = `You are the phone assistant for a self-storage facility, currently in a founder pilot test — this is real, but early, and you should sound like a helpful, competent front desk person, not a chatbot.

Your job on every call:
1. Greet the caller professionally and briefly.
2. Figure out what they need: renting a unit, a pricing question, checking availability, or something else.
3. Collect what's useful: what size unit (if relevant), when they need it, and the best phone number to reach them back on.
4. Keep it concise. Don't ramble, don't make small talk, don't repeat yourself.

You do not have access to real-time pricing or unit availability. Because of that:
- Never quote a specific price.
- Never confirm a specific unit is available.
- Never promise a move-in date, a discount, or anything you can't actually verify.
- Never pretend to know something you don't.

When someone asks something you can't answer (pricing, availability, specific policies), say so plainly and offer a follow-up: something like "I don't have that in front of me right now, but I'll make sure someone from the facility calls you back with the details." Then keep gathering what they need, if you haven't already.

Before ending the call, confirm what they're looking for and the best number to reach them.

You are not authorized to negotiate, guarantee anything, or make commitments on the facility's behalf. A real person always follows up.`;

async function vapiRequest(pathname, body) {
	const res = await fetch(`https://api.vapi.ai${pathname}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${VAPI_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const data = await res.json();

	if (!res.ok) {
		console.error(`Vapi API error (${pathname}):`, JSON.stringify(data, null, 2));
		process.exit(1);
	}

	return data;
}

console.log('Creating Vapi assistant...');

const assistant = await vapiRequest('/assistant', {
	name: 'StorageAI Founder Pilot',
	model: {
		provider: 'openai',
		model: 'gpt-4o-mini',
		messages: [{ role: 'system', content: SYSTEM_PROMPT }],
	},
	firstMessage: 'Thanks for calling — how can I help you today?',
	server: {
		url: webhookUrl,
		headers: { 'X-Vapi-Webhook-Secret': webhookSecret },
	},
});

console.log('Created assistant:', assistant.id);

console.log('Importing Twilio number into Vapi...');

const phoneNumber = await vapiRequest('/phone-number', {
	provider: 'twilio',
	number: TWILIO_FROM_NUMBER,
	twilioAccountSid: TWILIO_ACCOUNT_SID,
	twilioAuthToken: TWILIO_AUTH_TOKEN,
	name: 'StorageAI Founder Pilot',
	assistantId: assistant.id,
});

console.log('Imported number:', phoneNumber.number ?? TWILIO_FROM_NUMBER);
console.log();
console.log('Done. Next steps:');
console.log('1. Add these to the Vercel project (Settings -> Environment Variables):');
console.log(`   VAPI_ASSISTANT_ID=${assistant.id}`);
console.log(`   VAPI_WEBHOOK_SECRET=${webhookSecret}`);
console.log('2. Redeploy (env var changes need a new deployment to take effect).');
console.log(`3. Call ${TWILIO_FROM_NUMBER} for real and confirm Vapi answers instead of the old static greeting.`);
console.log();
console.log('Note: this number no longer uses /api/twilio/voice for inbound calls — Vapi now owns its webhook');
console.log('configuration directly. That endpoint and its tests are untouched and still work if a number is');
console.log('ever removed from Vapi and needs to fall back to it.');
