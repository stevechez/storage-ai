import { describe, expect, it } from 'vitest';
import { deriveOutcome, summarizeOutcomes, summarizeRecentOutcomes } from './outcomes';
import type { FollowUp } from '@/types/leasing';

describe('deriveOutcome', () => {
	it('treats a new opportunity as pending', () => {
		expect(deriveOutcome('new')).toBe('pending');
	});

	it('treats a contacted opportunity as still pending', () => {
		expect(deriveOutcome('contacted')).toBe('pending');
	});

	it('treats a converted opportunity as converted', () => {
		expect(deriveOutcome('converted')).toBe('converted');
	});

	it('treats a lost opportunity as lost', () => {
		expect(deriveOutcome('lost')).toBe('lost');
	});
});

function followUp(status: FollowUp['status'], createdAt = '2026-07-23T12:00:00.000Z'): FollowUp {
	return {
		callId: `call-${status}`,
		callerPhone: null,
		status,
		createdAt,
		opportunity: {
			intent: 'general',
			priority: 'low',
			recommendedAction: 'Follow up with renter',
		},
	};
}

describe('summarizeOutcomes', () => {
	it('counts opportunities by derived outcome', () => {
		const followUps = [
			followUp('new'),
			followUp('contacted'),
			followUp('converted'),
			followUp('converted'),
			followUp('lost'),
		];

		expect(summarizeOutcomes(followUps)).toEqual({
			pending: 2,
			converted: 2,
			lost: 1,
		});
	});

	it('returns all zeros for an empty list', () => {
		expect(summarizeOutcomes([])).toEqual({ pending: 0, converted: 0, lost: 0 });
	});
});

describe('summarizeRecentOutcomes', () => {
	it('only counts opportunities within the last 24 hours by default', () => {
		const now = new Date('2026-07-23T12:00:00.000Z');

		const followUps: FollowUp[] = [
			followUp('converted', '2026-07-23T06:00:00.000Z'), // 6h ago — recent
			followUp('new', '2026-07-22T13:00:00.000Z'), // 23h ago — recent
			followUp('lost', '2026-07-21T00:00:00.000Z'), // 60h ago — too old
		];

		expect(summarizeRecentOutcomes(followUps, now)).toEqual({
			pending: 1,
			converted: 1,
			lost: 0,
		});
	});

	it('returns all zeros when nothing falls within the window', () => {
		const now = new Date('2026-07-23T12:00:00.000Z');
		const followUps = [followUp('converted', '2026-07-01T00:00:00.000Z')];

		expect(summarizeRecentOutcomes(followUps, now)).toEqual({ pending: 0, converted: 0, lost: 0 });
	});
});
