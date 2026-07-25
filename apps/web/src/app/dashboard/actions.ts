'use server';

import { revalidatePath } from 'next/cache';
import { updateFollowUpStatus } from '@/lib/storage/follow-up';
import { logCall } from '@/lib/storage/calls';
import type { OpportunityStatus } from '@/types/leasing';

export interface LogCallFormState {
	status: 'idle' | 'success' | 'error';
	message?: string;
}

export async function logCallAction(
	_prevState: LogCallFormState,
	formData: FormData,
): Promise<LogCallFormState> {
	const facilityId = formData.get('facilityId');
	const caller = formData.get('caller');
	const transcript = formData.get('transcript');

	if (typeof facilityId !== 'string' || facilityId.trim() === '') {
		return { status: 'error', message: 'Missing facility.' };
	}

	if (typeof caller !== 'string' || caller.trim() === '') {
		return { status: 'error', message: 'Caller phone number is required.' };
	}

	try {
		await logCall({
			facilityId,
			caller: caller.trim(),
			transcript: typeof transcript === 'string' && transcript.trim() !== '' ? transcript.trim() : undefined,
		});
	} catch (error) {
		console.error('Failed to log call', error);
		return { status: 'error', message: 'Something went wrong. Please try again.' };
	}

	revalidatePath('/dashboard');

	return { status: 'success', message: "Call logged — check Today's Actions for the analysis." };
}

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
