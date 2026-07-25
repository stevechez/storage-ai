import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata = {
	title: 'Privacy Policy — StorageAI',
};

export default function PrivacyPage() {
	return (
		<div className="flex min-h-full flex-col">
			<Navbar />
			<main className="flex-1 bg-concrete px-6 py-16 sm:px-10 lg:px-16">
				<div className="mx-auto max-w-2xl">
					<p className="font-mono text-xs tracking-[0.2em] text-steel uppercase">Privacy Policy</p>
					<h1 className="mt-4 font-display text-3xl font-black text-ink">How StorageAI handles your data</h1>
					<p className="mt-4 text-sm text-steel">
						Last updated {new Date().getFullYear()}. StorageAI is an early-stage, founder-run product —
						this policy is intentionally simple, and will get more formal as the company grows. If
						anything here is unclear, email the founder directly (see Contact below) rather than guess.
					</p>

					<div className="mt-10 space-y-8 text-sm text-steel">
						<section>
							<h2 className="font-display text-lg font-bold text-ink">What we collect</h2>
							<p className="mt-2">
								If you sign up for early access: your name, email, facility name, and anything you write
								in the message field.
							</p>
							<p className="mt-2">
								If your facility is a pilot customer: basic facility and contact information you or the
								founder provide, plus data from calls handled through StorageAI — the caller&apos;s phone
								number, a transcript of the call, and StorageAI&apos;s automated read of what the call was
								about.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">How we use it</h2>
							<p className="mt-2">
								Early access signups are used only to follow up about a possible pilot — nothing is sold
								or shared for marketing. Call data for pilot facilities is used to run the product
								itself: showing the operator what happened on a call and what to do about it.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">Who has access</h2>
							<p className="mt-2">
								Right now, StorageAI is a single-founder operation. The founder has access to data
								needed to run and support the product. Data is not sold to third parties.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">Third-party services we use</h2>
							<p className="mt-2">
								Supabase (database hosting), Vercel (application hosting), and — for pilot facilities
								using the phone/voice feature — Twilio and Vapi (call handling and transcription). Each
								processes data only as needed to make StorageAI work.
							</p>
						</section>

						<section>
							<h2 className="font-display text-lg font-bold text-ink">Your data, your choice</h2>
							<p className="mt-2">
								Email the founder to request a copy of your data or to have it deleted. There&apos;s no
								self-service option yet — a direct email gets a direct, personal response, which is how
								this whole product is meant to work anyway.
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
