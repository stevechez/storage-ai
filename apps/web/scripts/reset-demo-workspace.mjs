#!/usr/bin/env node
// Restores the canonical demo workspace dataset (Phase 44c). Deletes every
// call currently against the demo facility and reloads the same curated
// story — a deliberate, reviewed set of calls, not randomly generated.
//
// This is a developer/admin action, run directly from a terminal — NOT an
// in-app dashboard button. The dashboard has no authentication, and the demo
// dashboard link is specifically the one meant to be shared during sales
// conversations; putting a destructive reset control on that page would mean
// anyone holding the link could trigger it. A CLI script only Steve can run,
// requiring real production credentials, is the safe equivalent.
//
// Usage (run from apps/web):
//
//   node scripts/reset-demo-workspace.mjs
//
// Credentials: reads apps/web/.env.production.local (same convention as
// onboard-facility.mjs) — NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// for the real production project.
//
// Timestamps are computed relative to "now" at run time, not replayed as
// fixed calendar dates — the dashboard's "Recent Results (Last 24 Hours)"
// section (lib/storage/outcomes.ts's summarizeRecentOutcomes) uses a real
// rolling time window, so a reset that replayed the original fixed dates
// would look increasingly stale (and eventually show zero "recent" activity)
// the longer this script goes unused. Recomputing offsets from "now" is what
// makes this genuinely repeatable rather than just idempotent once.
//
// The story itself (who called, what they wanted, how it resolved) is fixed
// and versioned here — this is the one and only place it should be edited.
// Do not regenerate it, randomize it, or add to it casually; changing the
// demo's story is a deliberate content decision, same as editing marketing
// copy, not a routine code change.

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(webRoot, '.env.production.local');

const DEMO_FACILITY_ID = '11111111-1111-1111-1111-111111111111';

function loadEnv(filePath) {
	if (!existsSync(filePath)) {
		console.error(`Missing ${filePath}`);
		console.error('Create it with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production.');
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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
	console.error(`${envPath} must define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY`);
	process.exit(1);
}

if (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')) {
	console.error(`${envPath} points at localhost, not production. Refusing to run — check the file.`);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Canonical demo story — 10 calls, a believable mix of outcomes and unit
// sizes. hoursAgo is relative to script run time; the one deliberately older
// "last month" example (240h ≈ 10 days) sits outside the 24-hour "Recent
// Results" window on purpose, as historical context rather than recent
// activity — the other nine are spread across the last ~24 hours so that
// section always shows real variety right after a reset.
const CANONICAL_CALLS = [
	{ caller: '+15125550124', status: 'converted', hoursAgo: 240, transcript: 'Customer rented a 5x5 unit last month for winter storage.' },
	{ caller: '+15125550120', status: 'new', hoursAgo: 20, transcript: 'Customer called at 9pm asking about a 10x15 unit. Needs it ASAP.' },
	{ caller: '+15125550121', status: 'new', hoursAgo: 14, transcript: 'Customer wants a 10x10 unit this weekend for a move.' },
	{ caller: '+15125550122', status: 'contacted', hoursAgo: 10, transcript: 'Customer asked how much storage costs per month.' },
	{ caller: '+15125550123', status: 'contacted', hoursAgo: 8, transcript: 'Customer called to ask if anything is available tomorrow.' },
	{ caller: '+15125550125', status: 'lost', hoursAgo: 6, transcript: 'Customer wanted a 10x20 unit today but chose another facility.' },
	{ caller: '+15125550126', status: 'new', hoursAgo: 4, transcript: 'Customer called asking general questions about storage options.' },
	{ caller: '+15125550110', status: 'new', hoursAgo: 3, transcript: 'Customer wants a 10x10 unit this weekend. What is the price?' },
	{ caller: '+15125550111', status: 'contacted', hoursAgo: 2, transcript: 'Customer asked about a 5x10 unit. Called back and sent availability.' },
	{ caller: '+15125550112', status: 'converted', hoursAgo: 1, transcript: 'Customer rented a 10x20 unit today.' },
];

const now = Date.now();

console.log(`Deleting existing calls for demo facility ${DEMO_FACILITY_ID}...`);

const { error: deleteError, count } = await supabase
	.from('calls')
	.delete({ count: 'exact' })
	.eq('facility_id', DEMO_FACILITY_ID);

if (deleteError) {
	console.error('Failed to delete existing demo calls:', deleteError.message);
	process.exit(1);
}

console.log(`Deleted ${count ?? 0} existing call(s).`);

console.log(`Inserting ${CANONICAL_CALLS.length} canonical calls...`);

const rows = CANONICAL_CALLS.map(call => ({
	facility_id: DEMO_FACILITY_ID,
	caller_phone: call.caller,
	transcript: call.transcript,
	status: call.status,
	created_at: new Date(now - call.hoursAgo * 60 * 60 * 1000).toISOString(),
}));

const { error: insertError } = await supabase.from('calls').insert(rows);

if (insertError) {
	console.error('Failed to insert canonical demo calls:', insertError.message);
	console.error('Demo facility currently has NO calls — re-run this script to restore them.');
	process.exit(1);
}

console.log('Done. Demo workspace restored to its canonical dataset.');
console.log(`Verify: https://storage-ai-sigma.vercel.app/dashboard?facility=${DEMO_FACILITY_ID}`);
