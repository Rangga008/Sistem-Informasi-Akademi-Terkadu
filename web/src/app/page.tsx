"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Users,
	Award,
	BookOpen,
	ChevronDown,
	Star,
	Sparkles,
	TrendingUp,
} from "lucide-react";

export default function Home() {
	const [isVisible, setIsVisible] = useState(false);
	const [statsVisible, setStatsVisible] = useState(false);
	const [featuresVisible, setFeaturesVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
		const timer1 = setTimeout(() => setStatsVisible(true), 1000);
		const timer2 = setTimeout(() => setFeaturesVisible(true), 1500);
		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
		};
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden">
			{/* Animated Background */}
			<div className="fixed inset-0 -z-10">
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
				<div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
				<div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
			</div>

			{/* Hero Section */}
			<section className="relative z-10 pt-20 pb-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div
						className={`text-center transition-all duration-1000 ${
							isVisible
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-8"
						}`}
					>
						<div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-8 shadow-lg animate-bounce">
							<Star className="w-4 h-4 text-yellow-500 animate-spin" />
							<span className="text-sm font-medium text-gray-700">
								✨ Platform Portofolio Siswa Terbaik
							</span>
						</div>

						<h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
							Temukan Talenta
							<span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
								Siswa Berbakat
							</span>
						</h2>

						<p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
							Platform inovatif untuk siswa menampilkan portofolio, guru
							mengelola talenta, dan perusahaan menemukan bakat terbaik
							Indonesia.
							<span className="inline-block animate-pulse">🚀</span>
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
							<Link href="/search">
								<Button
									size="lg"
									className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
								>
									<Search className="w-5 h-5 mr-2 animate-pulse" />
									Mulai Pencarian
								</Button>
							</Link>
							<Link href="/register">
								<Button
									size="lg"
									variant="outline"
									className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-lg transform hover:scale-105 hover:-translate-y-1"
								>
									<Users className="w-5 h-5 mr-2" />
									Daftar Sekarang
								</Button>
							</Link>
						</div>

						{/* Animated Stats */}
						<div
							className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${
								statsVisible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-8"
							}`}
						>
							<div className="group cursor-pointer">
								<div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
									<div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
										500+
									</div>
									<div className="text-gray-600 font-medium">
										Siswa Terdaftar
									</div>
									<TrendingUp className="w-5 h-5 text-blue-500 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</div>
							<div className="group cursor-pointer">
								<div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
									<div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
										100+
									</div>
									<div className="text-gray-600 font-medium">
										Project Unggulan
									</div>
									<Award className="w-5 h-5 text-purple-500 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</div>
							<div className="group cursor-pointer">
								<div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
									<div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
										50+
									</div>
									<div className="text-gray-600 font-medium">Guru Aktif</div>
									<BookOpen className="w-5 h-5 text-green-500 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</div>
							<div className="group cursor-pointer">
								<div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
									<div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
										25+
									</div>
									<div className="text-gray-600 font-medium">
										Skill Diversifikasi
									</div>
									<Sparkles className="w-5 h-5 text-orange-500 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Scroll Indicator */}
				<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
					<div className="w-8 h-12 border-2 border-gray-400 rounded-full flex justify-center">
						<ChevronDown className="w-4 h-6 text-gray-400 mt-2 animate-pulse" />
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				className={`py-20 bg-white transition-all duration-1000 delay-700 ${
					featuresVisible
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-8"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h3 className="text-4xl font-bold text-gray-900 mb-4">
							Fitur Unggulan
						</h3>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Platform lengkap untuk mengembangkan dan menampilkan potensi siswa
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
							<CardContent className="p-8 text-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
								<div className="relative z-10">
									<div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
										<Search className="w-8 h-8 text-white" />
									</div>
									<h4 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
										Pencarian Pintar
									</h4>
									<p className="text-gray-600 mb-6 leading-relaxed">
										Temukan siswa berdasarkan skill, nama, atau project dengan
										algoritma pencarian canggih berbasis AI.
									</p>
									<Badge
										variant="secondary"
										className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-300 animate-pulse"
									>
										🤖 AI-Powered
									</Badge>
								</div>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:-rotate-1 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100">
							<CardContent className="p-8 text-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
								<div className="relative z-10">
									<div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
										<Award className="w-8 h-8 text-white" />
									</div>
									<h4 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">
										Portofolio Dinamis
									</h4>
									<p className="text-gray-600 mb-6 leading-relaxed">
										Tampilkan project dan skill dengan highlight yang menarik
										perhatian perusahaan dan recruiter.
									</p>
									<Badge
										variant="secondary"
										className="bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors duration-300 animate-pulse"
									>
										🎨 Interactive
									</Badge>
								</div>
							</CardContent>
						</Card>

						<Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100">
							<CardContent className="p-8 text-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
								<div className="relative z-10">
									<div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
										<BookOpen className="w-8 h-8 text-white" />
									</div>
									<h4 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-green-700 transition-colors duration-300">
										Dashboard Guru
									</h4>
									<p className="text-gray-600 mb-6 leading-relaxed">
										Kelola siswa, approve project, dan pantau perkembangan
										talenta secara real-time dengan mudah.
									</p>
									<Badge
										variant="secondary"
										className="bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-300 animate-pulse"
									>
										📊 Management
									</Badge>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
					<div className="animate-bounce mb-6">
						<Sparkles className="w-16 h-16 text-yellow-300 mx-auto" />
					</div>
					<h4 className="text-4xl font-bold text-white mb-6">
						Siap Memulai Perjalanan Anda?
					</h4>
					<p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
						Bergabunglah dengan ribuan siswa yang telah berhasil menampilkan
						potensi mereka melalui SisTerKadu.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/register">
							<Button
								size="lg"
								className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
							>
								🚀 Mulai Sekarang - Gratis!
							</Button>
						</Link>
						<Link href="/search">
							<Button
								size="lg"
								variant="outline"
								className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:shadow-lg transform hover:scale-105 hover:-translate-y-1"
							>
								🔍 Jelajahi Talenta
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="flex items-center justify-center mb-4 group cursor-pointer">
							<BookOpen className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
							<h5 className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
								SisTerKadu
							</h5>
						</div>
						<p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
							Membantu siswa Indonesia menampilkan bakat dan potensi terbaik
							mereka kepada dunia. 🌟
						</p>
						<div className="flex justify-center space-x-6 mb-8">
							<div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12 shadow-lg">
								<span className="text-lg font-bold">📘</span>
							</div>
							<div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12 shadow-lg">
								<span className="text-lg font-bold">🐦</span>
							</div>
							<div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12 shadow-lg">
								<span className="text-lg font-bold">📷</span>
							</div>
						</div>
						<div className="pt-8 border-t border-gray-800">
							<p className="text-gray-400 text-sm">
								© 2024 SisTerKadu. Dibuat dengan ❤️ untuk pendidikan Indonesia.
							</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
