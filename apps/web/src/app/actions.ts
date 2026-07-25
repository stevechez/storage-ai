'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export interface EarlyAccessFormState {
	status: 'idle' | 'success' | 'error';
	message?: string;
}

export async function submitEarlyAccessSignup(
	_prevState: EarlyAccessFormState,
	formData: FormData,
): Promise<EarlyAccessFormState> {
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

	if (error) {
		console.error('Failed to save early access signup', error);
		return { status: 'error', message: 'Something went wrong. Please try again.' };
	}

	return { status: 'success', message: "Thanks — we'll be in touch." };
}
