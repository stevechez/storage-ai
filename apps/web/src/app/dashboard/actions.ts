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

	await updateFollowUpStatus(callId, status as OpportunityStatus);

	revalidatePath('/dashboard');
}
