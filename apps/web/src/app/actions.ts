'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { estimateLostRevenue } from '@/lib/storage/missed-revenue';

export interface FormState {
	status: 'idle' | 'success' | 'error';
	message?: string;
}

export async function submitEarlyAccessSignup(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const name = formData.get('name');
	const email = formData.get('email');
	const facilityName = formData.get('facilityName');
	const message = formData.get('message');

	if (typeof name !== 'string' || name.trim() === '' || typeof email !== 'string' || email.trim() === '') {
		return { status: 'error', message: 'Name and email are required.' };
	}

	const supabase = createAdminClient();

	const { error } = await supabase.from('early_access_signups').insert({
		name: name.trim(),
		email: email.trim(),
		facility_name: typeof facilityName === 'string' && facilityName.trim() !== '' ? facilityName.trim() : null,
		message: typeof message === 'string' && message.trim() !== '' ? message.trim() : null,
	});

	if (error && error.code !== '23505') {
		console.error('Failed to save early access signup', error);
		return { status: 'error', message: 'Something went wrong. Please try again.' };
	}

	return { status: 'success', message: "Thanks — we'll be in touch." };
}

export async function submitMissedRevenueLead(
	_prevState: FormState,
	formData: FormData,
): Promise<FormState> {
	const name = formData.get('name');
	const email = formData.get('email');
	const facilityName = formData.get('facilityName');
	const biggestChallenge = formData.get('biggestChallenge');
	const missedCallsPerMonth = Number(formData.get('missedCallsPerMonth'));
	const likelyRenters = Number(formData.get('likelyRenters'));
	const avgMonthlyRate = Number(formData.get('avgMonthlyRate'));

	if (typeof name !== 'string' || name.trim() === '' || typeof email !== 'string' || email.trim() === '') {
		return { status: 'error', message: 'Name and email are required.' };
	}

	// Recompute server-side from the raw inputs rather than trusting client-computed totals.
	const safeMissedCalls = Number.isFinite(missedCallsPerMonth) ? missedCallsPerMonth : 0;
	const safeLikelyRenters = Number.isFinite(likelyRenters) ? likelyRenters : 0;
	const safeAvgMonthlyRate = Number.isFinite(avgMonthlyRate) ? avgMonthlyRate : 0;

	const { monthlyRevenueLost, annualRevenueLost } = estimateLostRevenue({
		likelyRenters: safeLikelyRenters,
		avgMonthlyRate: safeAvgMonthlyRate,
	});

	const challengeLabel =
		typeof biggestChallenge === 'string' && biggestChallenge.trim() !== '' ? biggestChallenge.trim() : 'Not specified';

	const message = [
		'Lost-revenue calculator submission:',
		`- Missed rental calls/mo: ${safeMissedCalls}`,
		`- Likely renters among those: ${safeLikelyRenters}`,
		`- Avg monthly rate: $${safeAvgMonthlyRate}`,
		`- Estimated monthly revenue lost: $${monthlyRevenueLost.toLocaleString('en-US')}`,
		`- Estimated annual revenue lost: $${annualRevenueLost.toLocaleString('en-US')}`,
		`- Biggest challenge: ${challengeLabel}`,
	].join('\n');

	const supabase = createAdminClient();

	const { error } = await supabase.from('early_access_signups').insert({
		name: name.trim(),
		email: email.trim(),
		facility_name: typeof facilityName === 'string' && facilityName.trim() !== '' ? facilityName.trim() : null,
		message,
		source: 'calculator',
	});

	if (error && error.code !== '23505') {
		console.error('Failed to save missed-revenue lead', error);
		return { status: 'error', message: 'Something went wrong. Please try again.' };
	}

	return { status: 'success', message: "Thanks — we'll send the full breakdown." };
}
