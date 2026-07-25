'use client';

import { useState } from 'react';
import type { ResponseDraft } from '@/types/leasing';
import { Card } from './card';

export function ResponseDraftCard({ draft }: { draft: ResponseDraft }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(draft.message);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<Card>
			<div className="text-sm text-gray-500 mb-2">Suggested Response</div>

			<p className="whitespace-pre-line text-sm">{draft.message}</p>

			<button
				onClick={handleCopy}
				className="mt-3 text-sm border rounded-md px-3 py-1 hover:bg-gray-50"
			>
				{copied ? 'Copied!' : 'Copy Response'}
			</button>
		</Card>
	);
}
