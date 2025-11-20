"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Sparkles, BookOpen, Key } from "lucide-react";
import { login } from "@/lib/api";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await login(email, password);

			// Normalize response shape from backend. Some backends return { access_token, user }
			// others return { token, user } or similar. Be permissive.
			const token = res?.token || res?.access_token || res?.accessToken;
			const user = res?.user || res;

			if (token) {
				localStorage.setItem("token", token);
			}

			// Use role from user object in response (don't fetch again, that causes 401)
			let role = user?.role;

			if (role === "TEACHER") {
				router.push("/dashboard/teacher");
			} else if (role === "STUDENT") {
				router.push("/dashboard/student");
			} else {
				router.push("/search");
			}
		} catch (error: any) {
			setError(error.response?.data?.message || "Email atau password salah");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8 animate-fade-in">
					<div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6 shadow-lg">
						<Key className="w-5 h-5 text-blue-600" />
						<span className="text-sm font-medium text-gray-700">
							🔐 Login SisTerKadu
						</span>
					</div>
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
						Selamat Datang Kembali!
					</h1>
					<p className="text-gray-600 text-lg">
						Masuk untuk melanjutkan perjalanan Anda
					</p>
				</div>

				<Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in-up">
					<CardHeader className="text-center pb-2">
						<CardTitle className="text-2xl font-bold text-gray-900">
							Masuk ke Akun
						</CardTitle>
						<p className="text-gray-600 mt-2">Masukkan kredensial Anda</p>
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
								<Label htmlFor="email" className="text-gray-700 font-semibold">
									📧 Email
								</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
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
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										placeholder="Password Anda"
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

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
								disabled={loading}
							>
								{loading ? (
									<div className="flex items-center gap-3">
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span>Masuk...</span>
									</div>
								) : (
									<div className="flex items-center gap-3">
										<LogIn className="w-5 h-5" />
										<span>🚀 Masuk Sekarang</span>
									</div>
								)}
							</Button>
						</form>

						<div className="mt-8 text-center space-y-4">
							<p className="text-gray-600">
								Belum punya akun?{" "}
								<Link
									href="/register"
									className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
								>
									Daftar di sini →
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
						Lupa password?{" "}
						<span className="text-blue-600 hover:underline cursor-pointer">
							Reset di sini
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
