import Image from 'next/image';
import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { ProblemSection } from '@/components/marketing/problem-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { BenefitsSection } from '@/components/marketing/benefits-section';
import { EarlyAccess } from '@/components/marketing/early-access';
import { Footer } from '@/components/marketing/footer';

export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
				<Navbar />
				<Hero />
				<ProblemSection />
				<HowItWorks />
				<BenefitsSection />
				<EarlyAccess />
				<Footer />
			</main>
		</div>
	);
}
