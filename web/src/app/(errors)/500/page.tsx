import ErrorPage from "@/components/error-page";

export default function Page500() {
	return (
		<ErrorPage
			code={500}
			title="Kesalahan server"
			message="Terjadi kesalahan pada server. Silakan coba beberapa saat lagi."
		/>
	);
}
