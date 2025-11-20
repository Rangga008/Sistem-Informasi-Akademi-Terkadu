import ErrorPage from "@/components/error-page";

export default function Page401() {
	return (
		<ErrorPage
			code={401}
			title="Tidak terautentikasi"
			message="Anda perlu login untuk mengakses halaman ini."
			actionHref="/login"
			actionLabel="Masuk"
		/>
	);
}
