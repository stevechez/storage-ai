'use server';

import { revalidatePath } from 'next/cache';
import { updateFollowUpStatus } from '@/lib/storage/follow-up';
import type { OpportunityStatus } from '@/types/leasing';

export async function updateFollowUpStatusAction(formData: FormData) {
	const callId = formData.get('callId');
	const status = formData.get('status');

	if (typeof callId !== 'string' || typeof status !== 'string') {
		return;
	}

	try {
		await updateFollowUpStatus(callId, status as OpportunityStatus);
	} catch (error) {
		console.error('Failed to update follow-up status', error);
		return;
	}

	revalidatePath('/dashboard');
}
