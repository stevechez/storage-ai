#!/usr/bin/env node
// Creates a new organization + facility pair for a real founder pilot
// customer, replacing hand-written SQL from memory (Phase 28 Task 2).
//
// Usage (run from apps/web, so @supabase/supabase-js resolves):
//
//   cd apps/web
//   node scripts/onboard-facility.mjs \
//     --name "Foo Self Storage" \
//     --address "123 Main St" --city Austin --state TX \
//     [--timezone "America/Chicago"] \
//     [--phone "+15125551234"] \
//     [--contact-name "Jane Doe"] [--contact-email "jane@foo.com"]
//
// Credentials: reads apps/web/.env.production.local, which must define
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the real
// production project. This is deliberately NOT apps/web/.env.local —
// `next dev` auto-loads .env.local, and mixing production credentials
// into that file is exactly what caused local dev to silently write to
// production earlier. .env.production.local is never auto-loaded by
// `next dev`, so this script can't be run by accident just by having a
// dev server running. Create the file yourself; it's already covered by
// apps/web/.gitignore's `.env*` pattern.
//
// Does NOT set a "founder pricing status" or any pause/active/pending
// field — that's Task 4, deferred until there's a real facility to
// design it against.

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(webRoot, '.env.production.local');

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (!token.startsWith('--')) continue;
		const key = token.slice(2);
		const value = argv[i + 1];
		args[key] = value;
		i += 1;
	}
	return args;
}

function loadEnv(filePath) {
	if (!existsSync(filePath)) {
		console.error(`Missing ${filePath}`);
		console.error('Create it with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production.');
		process.exit(1);
	}

	const env = {};
	for (const line of readFileSync(filePath, 'utf8').split('\n')) {
		const match = line.match(/^([A-Z_]+)=(.*)$/);
		if (match) env[match[1]] = match[2].trim();
	}
	return env;
}

const args = parseArgs(process.argv.slice(2));

if (!args.name || !args.address || !args.city || !args.state) {
	console.error('Required: --name --address --city --state');
	console.error('Optional: --timezone --phone --contact-name --contact-email');
	process.exit(1);
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

const { data: organization, error: orgError } = await supabase
	.from('organizations')
	.insert({ name: args.name })
	.select()
	.single();

if (orgError) {
	console.error('Failed to create organization:', orgError.message);
	process.exit(1);
}

const { data: facility, error: facilityError } = await supabase
	.from('facilities')
	.insert({
		organization_id: organization.id,
		name: args.name,
		address: args.address,
		city: args.city,
		state: args.state,
		timezone: args.timezone ?? 'America/New_York',
		phone: args.phone ?? null,
		contact_name: args['contact-name'] ?? null,
		contact_email: args['contact-email'] ?? null,
	})
	.select()
	.single();

if (facilityError) {
	console.error('Failed to create facility:', facilityError.message);
	console.error(`Orphaned organization created: ${organization.id} — clean it up manually.`);
	process.exit(1);
}

console.log('Created facility:', facility.id);
console.log('Dashboard link to send them:');
console.log(`  https://storage-ai-sigma.vercel.app/dashboard?facility=${facility.id}`);
