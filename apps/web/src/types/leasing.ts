export type OpportunityIntent = 'rental' | 'pricing' | 'availability' | 'general';

export type OpportunityPriority = 'high' | 'medium' | 'low';

export interface LeasingOpportunity {
	intent: OpportunityIntent;
	unitSize?: string;
	timeline?: string;
	priority: OpportunityPriority;
	recommendedAction: string;
}
