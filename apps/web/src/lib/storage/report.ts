import { createAdminClient } from '@/lib/supabase/admin';
import { analyzeTranscript } from './intelligence';
import type { LeasingOpportunity, MorningReport } from '@/types/leasing';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

const FOLLOW_UP_ACTION = {
	high: 'Call customer immediately.',
	medium: 'Follow up today.',
	low: 'Follow up when convenient.',
} as const;

export function summarizeOpportunities(opportunities: LeasingOpportunity[]): MorningReport {
	const highPriorityCount = opportunities.filter(o => o.priority === 'high').length;
	const mediumPriorityCount = opportunities.filter(o => o.priority === 'medium').length;
	const rentalRequests = opportunities.filter(o => o.intent === 'rental').length;
	const pricingQuestions = opportunities.filter(o => o.intent === 'pricing').length;
	const availabilityRequests = opportunities.filter(o => o.intent === 'availability').length;

	const topOpportunity = [...opportunities].sort(
		(a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
	)[0];

	const recommendedFollowUp: LeasingOpportunity | null = topOpportunity
		? { ...topOpportunity, recommendedAction: FOLLOW_UP_ACTION[topOpportunity.priority] }
		: null;

	return {
		highPriorityCount,
		mediumPriorityCount,
		rentalRequests,
		pricingQuestions,
		availabilityRequests,
		recommendedFollowUp,
	};
}

export async function getMorningReport(facilityId: string) {
	const supabase = createAdminClient();

	const { data: calls, error } = await supabase
		.from('calls')
		.select('*')
		.eq('facility_id', facilityId)
		.order('created_at', { ascending: false });

	if (error) {
		throw error;
	}

	const opportunities = calls.map(call => analyzeTranscript(call.transcript ?? ''));

	return {
		...summarizeOpportunities(opportunities),
		totalCalls: calls.length,
		recentCalls: calls,
	};
}
