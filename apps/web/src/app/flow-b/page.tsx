import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/flow-b/navbar';
import { Hero } from '@/components/marketing/flow-b/hero';
import { ProblemSection } from '@/components/marketing/flow-b/problem-section';
import { HowItWorks } from '@/components/marketing/flow-b/how-it-works';
import { IntegrationConfidence } from '@/components/marketing/flow-b/integration-confidence';
import { TrustSection } from '@/components/marketing/flow-b/trust-section';
import { RoiSection } from '@/components/marketing/flow-b/roi-section';
import { PricingSection } from '@/components/marketing/flow-b/pricing-section';
import { EarlyAccess } from '@/components/marketing/flow-b/early-access';
import { Footer } from '@/components/marketing/flow-b/footer';

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function FlowBPage() {
	return (
		<div className="flex min-h-full flex-col">
			<Navbar />
			<main className="flex-1">
				<Hero />
				<ProblemSection />
				<HowItWorks />
				<IntegrationConfidence />
				<TrustSection />
				<RoiSection />
				<PricingSection />
				<EarlyAccess />
			</main>
			<Footer />
		</div>
	);
}
