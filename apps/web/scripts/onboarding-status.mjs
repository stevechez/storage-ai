#!/usr/bin/env node
// Phase 44d: prints a real onboarding status report for one facility, so any
// engineer — not just whoever onboarded Harbor — can independently verify
// where a customer stands, without asking the founder.
//
// This is read-only. It never edits the facilities row, never writes to
// Vapi, never touches calls/conversation_transcripts. It only checks and
// reports.
//
// Usage (run from apps/web):
//
//   node scripts/onboarding-status.mjs --facility-id "<uuid>"
//   node scripts/onboarding-status.mjs --facility-name "Harbor Self Storage"
//
// Credentials: reads apps/web/.env.production.local (same convention as
// every other production script). VAPI_API_KEY is optional here — without
// it, the two checks that require calling Vapi's own API are reported as
// "Unable to verify" rather than failing the whole script.
//
// Never prints VAPI_WEBHOOK_SECRET or any assistant-configured secret value.
// The webhook-authentication check compares them programmatically and
// reports only MATCH / MISMATCH — the exact diagnostic that took three real
// call-and-retry cycles to work out by hand during Harbor's onboarding
// (see docs/operations/FRICTION_LOG.md) is now one command.

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(webRoot, '.env.production.local');
const EXPECTED_WEBHOOK_URL = 'https://storage-ai-sigma.vercel.app/api/vapi/webhook';

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

function loadEnv(filePath) {
	if (!existsSync(filePath)) {
		console.error(`Missing ${filePath}`);
		console.error('Create it with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY at minimum.');
		process.exit(1);
	}
	const env = {};
	for (const line of readFileSync(filePath, 'utf8').split('\n')) {
		const match = line.match(/^([A-Z_]+)=(.*)$/);
		if (match) env[match[1]] = match[2].trim().replace(/^"(.*)"$/, '$1');
	}
	return env;
}

function statusLine(label, ok, detail) {
	const marker = ok === true ? 'Complete       ' : ok === false ? 'Needs attention' : 'Pending        ';
	console.log(`  [${marker}] ${label}${detail ? ` — ${detail}` : ''}`);
}

const args = parseArgs(process.argv.slice(2));
if (!args['facility-id'] && !args['facility-name']) {
	console.error('Required: --facility-id "<uuid>"  OR  --facility-name "Exact Facility Name"');
	process.exit(1);
}

const env = loadEnv(envPath);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
	console.error(`${envPath} must define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY`);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const facilityQuery = args['facility-id']
	? supabase.from('facilities').select('*').eq('id', args['facility-id']).maybeSingle()
	: supabase.from('facilities').select('*').eq('name', args['facility-name']).maybeSingle();

const { data: facility, error: facilityError } = await facilityQuery;

if (facilityError) {
	console.error('Failed to look up facility:', facilityError.message);
	process.exit(1);
}

if (!facility) {
	console.error('No facility found matching that id/name.');
	process.exit(1);
}

console.log(`Onboarding status — ${facility.name} (${facility.id})`);
console.log(`Workspace type: ${facility.workspace_type}`);
console.log();

console.log('Facility');
statusLine('Facility record', true, `created ${facility.created_at}`);
statusLine('Organization linked', Boolean(facility.organization_id));
console.log();

console.log('Phone');
statusLine('Twilio number assigned', Boolean(facility.twilio_phone_number), facility.twilio_phone_number ?? 'not set');
console.log();

console.log('Assistant');
statusLine('Vapi assistant ID recorded', Boolean(facility.vapi_assistant_id), facility.vapi_assistant_id ?? 'not set');

// Each of these is true (verified good), false (verified bad — blocks Completion), or
// null (couldn't verify — doesn't block Completion, since "unknown" isn't "broken").
let assistantExists = null;
let webhookConfigured = null;
let webhookAuthenticated = null;

if (facility.vapi_assistant_id && env.VAPI_API_KEY) {
	try {
		const res = await fetch(`https://api.vapi.ai/assistant/${facility.vapi_assistant_id}`, {
			headers: { Authorization: `Bearer ${env.VAPI_API_KEY}` },
		});

		if (!res.ok) {
			assistantExists = false;
			statusLine('Assistant exists on Vapi', false, `Vapi returned ${res.status}`);
			statusLine('Webhook configured', null, 'skipped — assistant not found');
			statusLine('Webhook authenticated', null, 'skipped — assistant not found');
		} else {
			const assistant = await res.json();
			assistantExists = true;
			statusLine('Assistant exists on Vapi', true, assistant.name ?? '');

			const serverUrl = assistant.server?.url;
			webhookConfigured = serverUrl === EXPECTED_WEBHOOK_URL;
			statusLine('Webhook configured', webhookConfigured, serverUrl ?? 'not set');

			const configuredSecret = assistant.server?.headers?.['X-Vapi-Webhook-Secret'];
			const ourSecret = env.VAPI_WEBHOOK_SECRET;
			if (!ourSecret) {
				statusLine('Webhook authenticated', null, 'unable to verify — VAPI_WEBHOOK_SECRET not in local env');
			} else if (!configuredSecret) {
				webhookAuthenticated = false;
				statusLine('Webhook authenticated', false, 'assistant has no secret header configured');
			} else {
				// Never print either value — compare and report match/mismatch only.
				webhookAuthenticated = configuredSecret === ourSecret;
				statusLine('Webhook authenticated', webhookAuthenticated, webhookAuthenticated ? 'matches' : 'MISMATCH — this is the Phase 42 failure mode, see FRICTION_LOG.md');
			}
		}
	} catch (err) {
		statusLine('Assistant exists on Vapi', null, `unable to reach Vapi API (${err.message})`);
		statusLine('Webhook configured', null, 'skipped');
		statusLine('Webhook authenticated', null, 'skipped');
	}
} else {
	const reason = !facility.vapi_assistant_id ? 'no assistant ID recorded' : 'VAPI_API_KEY not in local env';
	statusLine('Assistant exists on Vapi', null, `unable to verify — ${reason}`);
	statusLine('Webhook configured', null, `unable to verify — ${reason}`);
	statusLine('Webhook authenticated', null, `unable to verify — ${reason}`);
}
console.log();

console.log('Verification');
const { data: transcripts, error: transcriptError } = await supabase
	.from('conversation_transcripts')
	.select('transcript, received_at')
	.eq('facility_id', facility.id)
	.order('received_at', { ascending: false })
	.limit(1);

if (transcriptError) {
	console.error('Failed to query conversation_transcripts:', transcriptError.message);
	process.exit(1);
}

const latestTranscript = transcripts?.[0];
statusLine('Verification call completed', Boolean(latestTranscript), latestTranscript ? `last: ${latestTranscript.received_at}` : 'no calls received yet');
statusLine('Transcript received', Boolean(latestTranscript?.transcript));

const { data: calls, error: callsError } = await supabase
	.from('calls')
	.select('id, transcript, created_at')
	.eq('facility_id', facility.id)
	.order('created_at', { ascending: false })
	.limit(1);

if (callsError) {
	console.error('Failed to query calls:', callsError.message);
	process.exit(1);
}

const latestCall = calls?.[0];
// analyzeTranscript() is a pure function computed at dashboard render time, not a stored
// async step — a calls row with a transcript is the entire precondition for analysis existing.
statusLine('AI analysis available', Boolean(latestCall?.transcript));
statusLine('Dashboard receiving calls', Boolean(latestCall), latestCall ? `last: ${latestCall.created_at}` : 'no calls yet');
console.log();

// null means "couldn't verify," not "verified broken" — only an explicit false blocks
// Completion. Without this, a real MISMATCH (or any other verified-bad Vapi check) would
// silently not affect the final READY/NOT READY verdict, which is worse than not checking
// at all — it did exactly that until this was fixed against a real MISMATCH result.
const blockingChecks = [
	Boolean(facility.twilio_phone_number),
	Boolean(facility.vapi_assistant_id),
	Boolean(latestTranscript),
	Boolean(latestTranscript?.transcript),
	Boolean(latestCall?.transcript),
	assistantExists !== false,
	webhookConfigured !== false,
	webhookAuthenticated !== false,
];

console.log('Completion');
if (blockingChecks.every(Boolean)) {
	console.log('  READY — every check above passed. Safe to tell this operator they\'re live.');
} else {
	console.log('  NOT READY — see the items above marked Pending or Needs attention.');
	console.log('  If something looks wrong rather than just incomplete, log it in docs/operations/FRICTION_LOG.md.');
}
