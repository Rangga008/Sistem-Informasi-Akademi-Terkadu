import ErrorPage from "@/components/error-page";

export default function NotFound() {
	return (
		<ErrorPage
			code={404}
			title="Halaman tidak ditemukan"
			message="Halaman yang Anda cari tidak tersedia atau telah dipindahkan."
		/>
	);
}
