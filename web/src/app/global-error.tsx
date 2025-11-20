"use client";
import ErrorPage from "@/components/error-page";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html>
			<body>
				<div className="min-h-screen flex items-center justify-center">
					<div>
						<ErrorPage
							code={500}
							title="Terjadi kesalahan pada aplikasi"
							message="Kami telah mencatat masalah ini. Silakan coba lagi."
						/>
						<div className="text-center -mt-6">
							<button
								type="button"
								onClick={reset}
								className="mt-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
							>
								Muat Ulang
							</button>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
