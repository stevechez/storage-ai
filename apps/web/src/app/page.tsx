import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { ProblemSection } from '@/components/marketing/problem-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { IntegrationConfidence } from '@/components/marketing/integration-confidence';
import { TrustSection } from '@/components/marketing/trust-section';
import { RoiSection } from '@/components/marketing/roi-section';
import { TomorrowSection } from '@/components/marketing/tomorrow-section';
import { PricingSection } from '@/components/marketing/pricing-section';
import { EarlyAccess } from '@/components/marketing/early-access';
import { Footer } from '@/components/marketing/footer';

export default function Home() {
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
				<TomorrowSection />
				<PricingSection />
				<EarlyAccess />
			</main>
			<Footer />
		</div>
	);
}
