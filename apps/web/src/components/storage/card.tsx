import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
	return <div className={`border rounded-lg p-5 ${className}`.trim()}>{children}</div>;
}
