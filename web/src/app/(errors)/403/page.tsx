import ErrorPage from "@/components/error-page";

export default function Page403() {
	return (
		<ErrorPage
			code={403}
			title="Akses dilarang"
			message="Anda tidak memiliki izin untuk mengakses halaman ini."
		/>
	);
}
