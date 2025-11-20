"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentDetailLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = use(params);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Link href="/dashboard/teacher/students">
					<Button variant="outline">← Kembali ke Siswa</Button>
				</Link>
			</div>
			{children}
		</div>
	);
}
