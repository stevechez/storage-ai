import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata = {
	title: 'Terms of Service — StorageAI',
};

export default function TermsPage() {
	return (
		<div className="flex min-h-full flex-col">
			<Navbar />
			<main className="flex-1 bg-concrete px-6 py-16 sm:px-10 lg:px-16">
				<div className="mx-auto max-w-2xl">
					<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Terms of Service</p>
					<h1 className="mt-4 font-display text-3xl font-black text-ink">Terms for using StorageAI</h1>
					<p className="mt-4 text-sm text-steel">
						Last updated {new Date().getFullYear()}. StorageAI is an early-stage, founder-supported
						product. These terms are intentionally simple and will become more formal as the company
						grows — if anything here is unclear, email the founder directly rather than guess.
					</p>

					<div className="mt-10 space-y-8 text-sm text-steel">
						<section>
							<h2 className="font-display text-lg font-bold text-ink">The founder pilot</h2>
							<p className="mt-2">
								Founder pilot facilities pay month-to-month, with no long-term contract. You can stop
								at any time by telling the founder directly — there&apos;s no cancellation flow to
								navigate because there isn&apos;t one yet, just a person to talk to.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">Acceptable use</h2>
							<p className="mt-2">
								Use StorageAI for its intended purpose — handling and understanding real leasing calls
								for your facility. Don&apos;t use it to send unsolicited communications, attempt to
								disrupt the service, or access data that isn&apos;t yours.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">No guarantees, yet</h2>
							<p className="mt-2">
								This is an early-stage product being actively built and tested. It&apos;s provided
								as-is, without uptime guarantees or warranties of any kind. If something breaks, tell
								the founder — that feedback is exactly what a founder pilot is for.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">Limitation of liability</h2>
							<p className="mt-2">
								StorageAI&apos;s recommendations and analysis are estimates, not guarantees — the
								operator always makes the final call on pricing, availability, and any commitment to a
								renter. To the extent permitted by law, StorageAI isn&apos;t liable for business
								decisions made based on its output.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">Changes to these terms</h2>
							<p className="mt-2">
								If these terms change in a way that matters to you, you&apos;ll hear it directly from
								the founder, not just find out from a diff on this page.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">Contact</h2>
							<p className="mt-2">
								<a href="mailto:stevechez@gmail.com" className="text-ink underline underline-offset-4">
									stevechez@gmail.com
								</a>
							</p>
						</section>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
