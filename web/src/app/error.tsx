"use client";
import ErrorPage from "@/components/error-page";
import { useEffect } from "react";

export default function GlobalRouteError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// eslint-disable-next-line no-console
		console.error("Route error:", error);
	}, [error]);

	return (
		<div className="min-h-[70vh] flex items-center justify-center">
			<div>
				<ErrorPage
					code={"Error"}
					title="Terjadi kesalahan"
					message="Silakan coba lagi atau kembali ke beranda."
				/>
				<div className="text-center -mt-6">
					<button
						type="button"
						onClick={reset}
						className="mt-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
					>
						Coba Muat Ulang
					</button>
				</div>
			</div>
		</div>
	);
}
