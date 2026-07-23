import type { FollowUp, LeasingOpportunity, OpportunityIntent, ResponseDraft } from '@/types/leasing';

const INTENT_OPENER: Record<OpportunityIntent, (unitPhrase: string) => string> = {
	rental: unitPhrase => `Thanks for reaching out about ${unitPhrase}.`,
	pricing: unitPhrase => `Thanks for asking about pricing for ${unitPhrase}.`,
	availability: unitPhrase => `Thanks for checking on availability for ${unitPhrase}.`,
	general: () => 'Thanks for reaching out to us.',
};

const INTENT_OFFER: Record<OpportunityIntent, string> = {
	rental: 'I can provide pricing and availability details.',
	pricing: "Here's a breakdown of pricing and next steps.",
	availability: 'I can confirm what units are available right now.',
	general: "I'd be happy to answer any questions you have.",
};

export function buildResponseMessage(opportunity: LeasingOpportunity): string {
	const unitPhrase = opportunity.unitSize ? `a ${opportunity.unitSize} unit` : 'a storage unit';
	const timelineSentence = opportunity.timeline
		? `We can help you get set up ${opportunity.timeline}.`
		: undefined;

	const paragraphs = [
		'Hi there,',
		INTENT_OPENER[opportunity.intent](unitPhrase),
		timelineSentence,
		INTENT_OFFER[opportunity.intent],
		'How can we help?',
	].filter((paragraph): paragraph is string => Boolean(paragraph));

	return paragraphs.join('\n\n');
}

export function generateResponseDraft(followUp: FollowUp): ResponseDraft {
	return {
		callId: followUp.callId,
		channel: 'phone',
		message: buildResponseMessage(followUp.opportunity),
	};
}
