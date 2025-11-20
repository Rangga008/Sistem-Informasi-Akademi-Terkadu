"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ui/image-with-fallback";
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
import {
	getTopStudents,
	getHighlightProjects,
	getOverviewStats,
} from "@/lib/api";

export default function Home() {
	const [isVisible, setIsVisible] = useState(false);
	const [statsVisible, setStatsVisible] = useState(false);
	const [featuresVisible, setFeaturesVisible] = useState(false);
	const [topStudents, setTopStudents] = useState<any[]>([]);
	const [projects, setProjects] = useState<any[]>([]);
	const [loadingData, setLoadingData] = useState(false);
	const [stats, setStats] = useState<{
		students: number;
		projectsHighlight: number;
		teachers: number;
		skillsDistinct: number;
	} | null>(null);

	useEffect(() => {
		setIsVisible(true);
		const timer1 = setTimeout(() => setStatsVisible(true), 1000);
		const timer2 = setTimeout(() => setFeaturesVisible(true), 1500);
		// initial data fetch
		const loadData = async () => {
			try {
				setLoadingData(true);
				const [students, projs, overview] = await Promise.all([
					getTopStudents(12).catch(() => []),
					getHighlightProjects().catch(() => []),
					getOverviewStats().catch(() => null),
				]);
				setTopStudents(students || []);
				setProjects((projs || []).slice(0, 12));
				if (overview) setStats(overview);
			} finally {
				setLoadingData(false);
			}
		};
		loadData();

		// simple polling for "realtime" updates
		const interval = setInterval(loadData, 30000); // 30s
		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
			clearInterval(interval);
		};
	}, []);

	const projectCards = useMemo(() => (projects || []).slice(0, 8), [projects]);

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden">
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
							<span className="block bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
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
									className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
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
									<div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
										{stats ? `${stats.students}+` : "..."}
									</div>
									<div className="text-gray-600 font-medium">
										Siswa Terdaftar
									</div>
									<TrendingUp className="w-5 h-5 text-blue-500 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</div>
							<div className="group cursor-pointer">
								<div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
									<div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
										{stats ? `${stats.projectsHighlight}+` : "..."}
									</div>
									<div className="text-gray-600 font-medium">
										Project Unggulan
									</div>
									<Award className="w-5 h-5 text-purple-500 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</div>
							<div className="group cursor-pointer">
								<div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
									<div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
										{stats ? `${stats.teachers}+` : "..."}
									</div>
									<div className="text-gray-600 font-medium">Guru Aktif</div>
									<BookOpen className="w-5 h-5 text-green-500 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							</div>
							<div className="group cursor-pointer">
								<div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
									<div className="text-4xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-300">
										{stats ? `${stats.skillsDistinct}+` : "..."}
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
				{/* Scroll indicator removed per request */}
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
						<Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border-0 shadow-xl bg-linear-to-br from-blue-50 to-blue-100">
							<CardContent className="p-8 text-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
								<div className="relative z-10">
									<div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
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

						<Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:-rotate-1 border-0 shadow-xl bg-linear-to-br from-purple-50 to-purple-100">
							<CardContent className="p-8 text-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
								<div className="relative z-10">
									<div className="w-16 h-16 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
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

						<Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border-0 shadow-xl bg-linear-to-br from-green-50 to-green-100">
							<CardContent className="p-8 text-center relative overflow-hidden">
								<div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
								<div className="relative z-10">
									<div className="w-16 h-16 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
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

			{/* Top Students Carousel */}
			<section className="py-20 bg-linear-to-b from-white to-blue-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-end justify-between mb-6">
						<div>
							<h3 className="text-3xl font-bold text-gray-900">
								Talenta Unggulan
							</h3>
							<p className="text-gray-600">
								Profil siswa dengan portofolio paling aktif
							</p>
						</div>
						<Link href="/search">
							<Button variant="outline">Lihat Semua</Button>
						</Link>
					</div>

					<div className="relative">
						<div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
							{(loadingData && topStudents.length === 0
								? Array.from({ length: 6 })
								: topStudents
							).map((s: any, idx: number) => (
								<div
									key={s?.id || idx}
									className="min-w-60 max-w-60 snap-start bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg transition-shadow duration-200"
								>
									<div className="p-4">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center overflow-hidden">
												{s?.avatar ? (
													// eslint-disable-next-line @next/next/no-img-element
													<ImageWithFallback
														src={`http://localhost:3001${s.avatar}`}
														alt={s.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<span className="text-lg font-bold">
														{s?.name?.[0]?.toUpperCase() || "?"}
													</span>
												)}
											</div>
											<div>
												<div className="font-semibold text-gray-900 line-clamp-1">
													{s?.name || "Loading..."}
												</div>
												<div className="text-xs text-gray-500">
													{s?._count?.projects ?? 0} project
												</div>
											</div>
										</div>
										<div className="flex flex-wrap gap-1 mb-3">
											{(s?.skills || [])
												.slice(0, 4)
												.map((sk: any, i: number) => (
													<span
														key={i}
														className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs"
													>
														{sk.name}
													</span>
												))}
										</div>
										<Link href={`/profile/${s?.id || "#"}`}>
											<Button size="sm" className="w-full">
												Lihat Profil
											</Button>
										</Link>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Highlight Projects Grid */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-end justify-between mb-6">
						<div>
							<h3 className="text-3xl font-bold text-gray-900">
								Project Terbaru
							</h3>
							<p className="text-gray-600">
								Highlight project yang baru ditambahkan
							</p>
						</div>
						<Link href="/search">
							<Button variant="outline">Jelajahi</Button>
						</Link>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{(loadingData && projectCards.length === 0
							? Array.from({ length: 8 })
							: projectCards
						).map((p: any, idx: number) => (
							<div
								key={p?.id || idx}
								className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200"
							>
								<div className="aspect-video bg-gray-100 overflow-hidden">
									{p?.thumbnail || (p?.images && p.images[0]) ? (
										// eslint-disable-next-line @next/next/no-img-element
										<ImageWithFallback
											src={`http://localhost:3001${p.thumbnail || p.images[0]}`}
											alt={p?.title || "Project"}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-gray-400">
											No Image
										</div>
									)}
								</div>
								<div className="p-4">
									<div className="text-sm text-gray-500 mb-1 line-clamp-1">
										{p?.user?.name || ""}
									</div>
									<div className="font-semibold text-gray-900 mb-1 line-clamp-1">
										{p?.title || "Loading..."}
									</div>
									<div className="text-sm text-gray-600 line-clamp-2">
										{p?.description || ""}
									</div>
									<div className="mt-3">
										<Link href={p?.id ? `/project/${p.id}` : "#"}>
											<Button variant="outline" size="sm" className="w-full">
												Lihat Detail
											</Button>
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
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
				<div className="absolute inset-0 bg-linear-to-r from-blue-900/20 to-purple-900/20"></div>
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="flex items-center justify-center mb-4 group cursor-pointer">
							<BookOpen className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
							<h5 className="ml-2 text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
