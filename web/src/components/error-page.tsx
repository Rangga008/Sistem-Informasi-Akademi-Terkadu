"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type ErrorPageProps = {
	code: number | string;
	title: string;
	message?: string;
	actionHref?: string;
	actionLabel?: string;
};

export default function ErrorPage({
	code,
	title,
	message,
	actionHref = "/",
	actionLabel = "Kembali ke Beranda",
}: ErrorPageProps) {
	const router = useRouter();
	return (
		<div className="min-h-[70vh] flex items-center justify-center px-6 py-16 bg-linear-to-b from-white to-gray-50">
			<div className="text-center max-w-xl">
				<div className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
					<span className="text-3xl font-extrabold text-blue-600 tabular-nums">
						{code}
					</span>
				</div>
				<h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">
					{title}
				</h1>
				{message ? <p className="mt-3 text-gray-600">{message}</p> : null}

				<div className="mt-8 flex items-center justify-center gap-3">
					<button
						type="button"
						onClick={() => router.back()}
						className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
					>
						Kembali
					</button>
					<Link
						href={actionHref}
						className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
					>
						{actionLabel}
					</Link>
				</div>
			</div>
		</div>
	);
}
