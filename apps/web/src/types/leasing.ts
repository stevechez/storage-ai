export type OpportunityIntent = 'rental' | 'pricing' | 'availability' | 'general';

export type OpportunityPriority = 'high' | 'medium' | 'low';

export interface LeasingOpportunity {
	intent: OpportunityIntent;
	unitSize?: string;
	timeline?: string;
	priority: OpportunityPriority;
	recommendedAction: string;
}

export interface MorningReport {
	highPriorityCount: number;
	mediumPriorityCount: number;
	rentalRequests: number;
	pricingQuestions: number;
	availabilityRequests: number;
	recommendedFollowUp: LeasingOpportunity | null;
}

export type OpportunityStatus = 'new' | 'contacted' | 'converted' | 'lost';

export interface FollowUp {
	callId: string;
	callerPhone: string | null;
	opportunity: LeasingOpportunity;
	status: OpportunityStatus;
	createdAt: string;
}

export type ResponseChannel = 'phone' | 'sms' | 'email';

export interface ResponseDraft {
	callId: string;
	channel: ResponseChannel;
	message: string;
}

export type OpportunityOutcome = 'pending' | 'converted' | 'lost';

export interface OutcomeSummary {
	pending: number;
	converted: number;
	lost: number;
}

export interface OperatorAction {
	callId: string;
	callerPhone: string | null;
	opportunity: LeasingOpportunity;
}
