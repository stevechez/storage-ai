#!/usr/bin/env node
// Creates a Vapi assistant for one facility and imports a Twilio number
// into it, so inbound calls to that number are answered by Vapi instead
// of the static /api/twilio/voice greeting (Phase 39 Task 1 + Task 2;
// parameterized per facility in Phase 41 so a second facility doesn't
// need a code change — see docs/architecture/FOUNDER_DEPENDENCY_AUDIT.md).
//
// Usage (run from apps/web, so module resolution + relative paths work):
//
//   cd apps/web
//   node scripts/setup-vapi-assistant.mjs --facility-name "Joe's Self Storage" [--number "+1..."]
//
// --number overrides TWILIO_FROM_NUMBER from .env.production.local for this
// run — needed once a second facility has its own purchased number, since
// that env var only ever holds one value.
//
// Credentials: reads apps/web/.env.production.local, which must define
// VAPI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and (unless --number
// is passed) TWILIO_FROM_NUMBER — same file scripts/onboard-facility.mjs
// already uses for production tooling credentials, never auto-loaded by
// `next dev`.
//
// Not idempotent by design: running it again creates a new assistant and
// imports whatever number you pass. That's expected for a second facility.
// The one thing this script does NOT do is write the resulting assistant
// ID / phone number into the facilities table — that's still a deliberate
// manual step (see FOUNDER_PROVISIONING_CHECKLIST.md), per this phase's
// "don't automate until the manual process is understood" principle.
//
// Webhook secret: VAPI_WEBHOOK_SECRET is one shared value across every
// assistant (the webhook route only needs to confirm a request came from
// this project's own Vapi setup, not which facility — see the dependency
// audit). If .env.production.local already defines it, this script reuses
// it instead of generating a new one, so a second facility's assistant
// doesn't get a secret nothing will actually accept.

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (!token.startsWith('--')) continue;
		args[token.slice(2)] = argv[i + 1];
		i += 1;
	}
	return args;
}

const cliArgs = parseArgs(process.argv.slice(2));

if (!cliArgs['facility-name']) {
	console.error('Required: --facility-name "Exact Facility Name"');
	console.error('Optional: --number "+1..." (overrides TWILIO_FROM_NUMBER for this run)');
	process.exit(1);
}

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
const { VAPI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, VAPI_WEBHOOK_SECRET } = env;

const numberToImport = cliArgs.number ?? TWILIO_FROM_NUMBER;

for (const [name, value] of Object.entries({
	VAPI_API_KEY,
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
})) {
	if (!value) {
		console.error(`${envPath} must define ${name}`);
		process.exit(1);
	}
}

if (!numberToImport) {
	console.error(`Pass --number, or define TWILIO_FROM_NUMBER in ${envPath}`);
	process.exit(1);
}

const isFirstTimeSecret = !VAPI_WEBHOOK_SECRET;
const webhookSecret = VAPI_WEBHOOK_SECRET ?? randomBytes(32).toString('hex');
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

const facilityName = cliArgs['facility-name'];

console.log(`Creating Vapi assistant for ${facilityName}...`);

const assistant = await vapiRequest('/assistant', {
	name: facilityName,
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

console.log(`Importing ${numberToImport} into Vapi...`);

const phoneNumber = await vapiRequest('/phone-number', {
	provider: 'twilio',
	number: numberToImport,
	twilioAccountSid: TWILIO_ACCOUNT_SID,
	twilioAuthToken: TWILIO_AUTH_TOKEN,
	name: facilityName,
	assistantId: assistant.id,
});

console.log('Imported number:', phoneNumber.number ?? numberToImport);
console.log();
console.log('Done. Next steps:');
console.log(`1. Record these on the ${facilityName} row in the facilities table (Supabase Studio or SQL):`);
console.log(`   twilio_phone_number = '${numberToImport}'`);
console.log(`   vapi_assistant_id   = '${assistant.id}'`);
if (isFirstTimeSecret) {
	console.log('2. This is the first assistant set up — add VAPI_WEBHOOK_SECRET to the Vercel project');
	console.log(`   (Settings -> Environment Variables) and redeploy: VAPI_WEBHOOK_SECRET=${webhookSecret}`);
	console.log('   Every future facility reuses this same value automatically (read from');
	console.log('   .env.production.local) — do not generate a new one per facility.');
} else {
	console.log('2. Reused the existing VAPI_WEBHOOK_SECRET — nothing to change in Vercel.');
}
console.log(`3. Call ${numberToImport} for real and confirm Vapi answers instead of the old static greeting.`);
console.log('4. Confirm a real call lands in conversation_transcripts/calls against the RIGHT facility —');
console.log('   see FOUNDER_PROVISIONING_CHECKLIST.md\'s verification section.');
console.log();
console.log('Note: this number no longer uses /api/twilio/voice for inbound calls — Vapi now owns its webhook');
console.log('configuration directly. That endpoint and its tests are untouched and still work if a number is');
console.log('ever removed from Vapi and needs to fall back to it.');
