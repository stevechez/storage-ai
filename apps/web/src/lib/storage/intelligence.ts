import type { LeasingOpportunity, OpportunityIntent, OpportunityPriority } from '@/types/leasing';

const UNIT_SIZE_PATTERN = /\b(\d{1,2}\s?x\s?\d{1,2})\b/i;
const RENTAL_KEYWORDS = /\b(rent|renting|unit|need a|want a|wants a|looking for)\b/i;
const PRICING_KEYWORDS = /\b(price|pricing|cost|how much)\b/i;
const AVAILABILITY_KEYWORDS = /\b(available|availability|open)\b/i;

const TIMELINE_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
	{ pattern: /this weekend/i, label: 'this weekend' },
	{ pattern: /\btoday\b/i, label: 'today' },
	{ pattern: /\btomorrow\b/i, label: 'tomorrow' },
	{ pattern: /\basap\b/i, label: 'asap' },
];

function detectIntent(transcript: string): OpportunityIntent {
	if (RENTAL_KEYWORDS.test(transcript)) return 'rental';
	if (PRICING_KEYWORDS.test(transcript)) return 'pricing';
	if (AVAILABILITY_KEYWORDS.test(transcript)) return 'availability';
	return 'general';
}

function detectUnitSize(transcript: string): string | undefined {
	const match = transcript.match(UNIT_SIZE_PATTERN);
	return match ? match[1].replace(/\s+/g, '').toLowerCase() : undefined;
}

function detectTimeline(transcript: string): string | undefined {
	const found = TIMELINE_KEYWORDS.find(({ pattern }) => pattern.test(transcript));
	return found?.label;
}

function detectPriority(timeline: string | undefined): OpportunityPriority {
	return timeline ? 'high' : 'medium';
}

function detectRecommendedAction(intent: OpportunityIntent, transcript: string): string {
	const mentionsPricing = PRICING_KEYWORDS.test(transcript);
	const mentionsAvailability = AVAILABILITY_KEYWORDS.test(transcript);

	if (intent === 'rental' && mentionsPricing) return 'Send pricing and availability';
	if (intent === 'rental') return 'Send availability link';
	if (intent === 'pricing') return 'Send pricing information';
	if (intent === 'availability' || mentionsAvailability) return 'Send availability information';
	return 'Follow up with renter';
}

export function describePriorityReason(opportunity: LeasingOpportunity): string {
	return opportunity.timeline
		? `Customer mentioned a timeline: "${opportunity.timeline}".`
		: 'No timeline mentioned yet.';
}

export function analyzeTranscript(transcript: string): LeasingOpportunity {
	const intent = detectIntent(transcript);
	const unitSize = detectUnitSize(transcript);
	const timeline = detectTimeline(transcript);
	const priority = detectPriority(timeline);
	const recommendedAction = detectRecommendedAction(intent, transcript);

	return {
		intent,
		unitSize,
		timeline,
		priority,
		recommendedAction,
	};
}
