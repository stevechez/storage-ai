import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { ProblemSection } from '@/components/marketing/problem-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { BenefitsSection } from '@/components/marketing/benefits-section';
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
				<BenefitsSection />
				<EarlyAccess />
			</main>
			<Footer />
		</div>
	);
}
