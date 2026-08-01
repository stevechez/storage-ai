const PRODUCT_LINKS = [
	{ label: 'How it works', href: '#how-it-works' },
	{ label: 'Pricing', href: '#pricing' },
	{ label: 'Founder pilot', href: '#early-access' },
];

const COMPANY_LINKS = [
	{ label: 'Why trust it', href: '#early-stage' },
	{ label: 'How it fits your operation', href: '#how-it-fits' },
	{ label: 'Contact', href: 'mailto:stevechez@gmail.com' },
];

const LEGAL_LINKS = [
	{ label: 'Privacy policy', href: '/privacy' },
	{ label: 'Terms of service', href: '/terms' },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
	return (
		<div>
			<p className="font-mono text-xs tracking-[0.2em] text-steel/70 uppercase">{title}</p>
			<ul className="mt-4 space-y-2 text-sm text-steel">
				{links.map(link => (
					<li key={link.label}>
						<a href={link.href} className="hover:text-ink">
							{link.label}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

export function Footer() {
	return (
		<footer className="border-t border-steel/20 bg-concrete px-6 py-12 sm:px-10 lg:px-16">
			<div className="mx-auto max-w-6xl">
				<div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
					<div className="col-span-2 sm:col-span-1">
						<p className="font-display text-lg font-bold text-ink">IntelliLease</p>
						<p className="mt-1 text-sm text-steel">
							Helping independent self-storage operators capture rentals they&apos;d otherwise miss.
						</p>
					</div>

					<FooterColumn title="Product" links={PRODUCT_LINKS} />
					<FooterColumn title="Company" links={COMPANY_LINKS} />
					<FooterColumn title="Legal" links={LEGAL_LINKS} />
				</div>

				<p className="mt-10 text-xs text-steel/70">
					© {new Date().getFullYear()} IntelliLease. Built for the operators who answer their own phones.
				</p>
			</div>
		</footer>
	);
}
