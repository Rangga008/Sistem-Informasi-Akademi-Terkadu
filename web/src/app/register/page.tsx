"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus, Sparkles, BookOpen } from "lucide-react";
import { register } from "@/lib/api";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "siswa", // Default to siswa
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const router = useRouter();

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validation
		if (formData.password !== formData.confirmPassword) {
			setError("Password tidak cocok");
			setLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			setError("Password minimal 6 karakter");
			setLoading(false);
			return;
		}

		try {
			await register({
				name: formData.name,
				email: formData.email,
				password: formData.password,
				role: formData.role,
			});

			setSuccess(true);
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (error: any) {
			setError(
				error.response?.data?.message || "Terjadi kesalahan saat registrasi"
			);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
				<Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
					<CardContent className="text-center py-12 px-8">
						<div className="relative mb-6">
							<div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
								<UserPlus className="w-10 h-10 text-white" />
							</div>
							<div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
								<Sparkles className="w-4 h-4 text-white" />
							</div>
						</div>
						<h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
							🎉 Registrasi Berhasil!
						</h2>
						<p className="text-gray-600 mb-6 leading-relaxed">
							Selamat! Akun Anda telah dibuat. Anda akan diarahkan ke halaman
							login dalam beberapa detik...
						</p>
						<div className="space-y-3">
							<Button
								onClick={() => router.push("/login")}
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
							>
								🚀 Masuk Sekarang
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push("/search")}
								className="w-full border-2 border-gray-200 hover:border-blue-300 py-3 rounded-full transition-all duration-300 hover:bg-blue-50"
							>
								🔍 Jelajahi Siswa Lain
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8 animate-fade-in">
					<div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6 shadow-lg">
						<BookOpen className="w-5 h-5 text-blue-600" />
						<span className="text-sm font-medium text-gray-700">
							📝 Registrasi SisTerKadu
						</span>
					</div>
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
						Bergabunglah!
					</h1>
					<p className="text-gray-600 text-lg">
						Mulai perjalanan Anda dalam dunia portofolio siswa
					</p>
				</div>

				<Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
					<CardHeader className="text-center pb-2">
						<CardTitle className="text-2xl font-bold text-gray-900">
							Buat Akun Siswa
						</CardTitle>
						<p className="text-gray-600 mt-2">
							Tampilkan bakat dan potensi Anda
						</p>
					</CardHeader>
					<CardContent className="px-8 pb-8">
						<form onSubmit={handleSubmit} className="space-y-6">
							{error && (
								<Alert
									variant="destructive"
									className="border-red-200 bg-red-50 animate-shake"
								>
									<AlertDescription className="text-red-800 font-medium">
										⚠️ {error}
									</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="name" className="text-gray-700 font-semibold">
									👤 Nama Lengkap
								</Label>
								<Input
									id="name"
									type="text"
									value={formData.name}
									onChange={(e) => handleChange("name", e.target.value)}
									required
									placeholder="Masukkan nama lengkap Anda"
									className="border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:shadow-md py-3 px-4 rounded-xl"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email" className="text-gray-700 font-semibold">
									📧 Email
								</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleChange("email", e.target.value)}
									required
									placeholder="nama@email.com"
									className="border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:shadow-md py-3 px-4 rounded-xl"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-gray-700 font-semibold"
								>
									🔒 Password
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={(e) => handleChange("password", e.target.value)}
										required
										placeholder="Minimal 6 karakter"
										className="border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:shadow-md py-3 px-4 pr-12 rounded-xl"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										) : (
											<Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										)}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className="text-gray-700 font-semibold"
								>
									🔄 Konfirmasi Password
								</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										value={formData.confirmPassword}
										onChange={(e) =>
											handleChange("confirmPassword", e.target.value)
										}
										required
										placeholder="Ulangi password Anda"
										className="border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 hover:shadow-md py-3 px-4 pr-12 rounded-xl"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										) : (
											<Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
										)}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
								disabled={loading}
							>
								{loading ? (
									<div className="flex items-center gap-3">
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span>Mendaftarkan...</span>
									</div>
								) : (
									<div className="flex items-center gap-3">
										<UserPlus className="w-5 h-5" />
										<span>🚀 Daftar Sekarang</span>
									</div>
								)}
							</Button>
						</form>

						<div className="mt-8 text-center space-y-4">
							<p className="text-gray-600">
								Sudah punya akun?{" "}
								<Link
									href="/login"
									className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
								>
									Masuk di sini →
								</Link>
							</p>
							<div className="border-t border-gray-200 pt-4">
								<Link
									href="/search"
									className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
								>
									<span>←</span>
									<span>Kembali ke pencarian</span>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Footer Note */}
				<div className="text-center mt-6">
					<p className="text-sm text-gray-500">
						Dengan mendaftar, Anda menyetujui{" "}
						<span className="text-blue-600 hover:underline cursor-pointer">
							Syarat & Ketentuan
						</span>{" "}
						SisTerKadu
					</p>
				</div>
			</div>
		</div>
	);
}
