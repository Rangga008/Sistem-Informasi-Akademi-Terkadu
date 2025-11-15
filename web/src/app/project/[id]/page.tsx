"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Star,
	Eye,
	Heart,
	Share2,
	ExternalLink,
	Calendar,
	MapPin,
	Globe,
	Github,
	Linkedin,
	Twitter,
	User,
	Briefcase,
	Award,
	ChevronLeft,
	ArrowLeft,
	Youtube,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";

interface User {
	id: string;
	name: string;
	email: string;
	bio?: string;
	avatar?: string;
	role: string;
	createdAt: string;
	github?: string;
	linkedin?: string;
	twitter?: string;
	website?: string;
	location?: string;
}

interface Project {
	id: string;
	title: string;
	description: string;
	images: string[];
	highlight: boolean;
	keywords: string[];
	createdAt: string;
	userId: string;
	user: User;
	github?: string;
	video?: string;
}

export default function ProjectDetailPage() {
	const params = useParams();
	const router = useRouter();
	const projectId = params.id as string;

	const [project, setProject] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	const loadProject = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/projects/${projectId}`);
			setProject(response.data);
		} catch (error) {
			console.error("Failed to load project:", error);
			router.push("/search");
		} finally {
			setLoading(false);
		}
	};

	const loadCurrentUser = async () => {
		try {
			const user = await getCurrentUser();
			setCurrentUser(user);
		} catch (error) {
			// User not logged in, that's ok
		}
	};

	useEffect(() => {
		loadProject();
		loadCurrentUser();
	}, [projectId]);

	const handleShare = async () => {
		const url = window.location.href;
		const title = `Lihat project ${project?.title}`;

		if (navigator.share) {
			try {
				await navigator.share({
					title,
					url,
				});
			} catch (error) {
				console.log("Error sharing:", error);
			}
		} else {
			navigator.clipboard.writeText(url);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Project tidak ditemukan
					</h2>
					<p className="text-gray-600 mb-4">
						Project yang Anda cari tidak tersedia.
					</p>
					<Link href="/search">
						<Button>Kembali ke Pencarian</Button>
					</Link>
				</div>
			</div>
		);
	}

	const { user } = project;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => router.back()}
								className="flex items-center"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Kembali
							</Button>
							<div className="h-6 w-px bg-gray-300"></div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									{project.title}
								</h1>
								<p className="text-sm text-gray-600">oleh {user.name}</p>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							{project.highlight && (
								<Badge className="bg-yellow-100 text-yellow-800">
									<Star className="w-3 h-3 mr-1 fill-current" />
									Highlight
								</Badge>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={handleShare}
								className="flex items-center"
							>
								<Share2 className="w-4 h-4 mr-2" />
								Bagikan
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Project Images */}
						{project.images && project.images.length > 0 && (
							<Card>
								<CardContent className="p-0">
									<div className="grid gap-4">
										{project.images.map((image, index) => (
											<div
												key={index}
												className="aspect-video bg-gray-200 rounded-lg overflow-hidden"
											>
												<img
													src={`http://localhost:3001${image}`}
													alt={`${project.title} - Image ${index + 1}`}
													className="w-full h-full object-cover"
												/>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Project Description */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Briefcase className="w-5 h-5 mr-2" />
									Deskripsi Project
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
									{project.description}
								</p>
							</CardContent>
						</Card>

						{/* Keywords */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Award className="w-5 h-5 mr-2" />
									Technologies & Skills
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{project.keywords.map((keyword, index) => (
										<Badge
											key={index}
											variant="outline"
											className="text-sm py-1 px-3"
										>
											{keyword}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Actions */}
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4 text-sm text-gray-500">
										<span className="flex items-center">
											<Eye className="w-4 h-4 mr-1" />
											Dilihat
										</span>
										<span className="flex items-center">
											<Calendar className="w-4 h-4 mr-1" />
											{new Date(project.createdAt).toLocaleDateString("id-ID", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<Button variant="outline" size="sm">
											<Heart className="w-4 h-4 mr-1" />
											Suka
										</Button>
										<Button variant="outline" size="sm">
											<Share2 className="w-4 h-4 mr-1" />
											Bagikan
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar - Creator Info */}
					<div className="lg:col-span-1">
						<Card className="sticky top-8">
							<CardHeader>
								<CardTitle className="flex items-center">
									<User className="w-5 h-5 mr-2" />
									Pembuat Project
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Creator Profile */}
								<div className="text-center">
									<Link href={`/profile/${user.id}`}>
										<Avatar className="w-20 h-20 border-4 border-blue-100 mx-auto mb-4 cursor-pointer hover:border-blue-200 transition-colors">
											<AvatarImage
												src={
													user.avatar
														? `http://localhost:3001${user.avatar}`
														: undefined
												}
												alt={user.name}
												onError={(e) => {
													e.currentTarget.style.display = "none";
													e.currentTarget.parentElement!.innerHTML =
														'<svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
												}}
											/>
											<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
												{user.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</Link>
									<Link href={`/profile/${user.id}`}>
										<h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
											{user.name}
										</h3>
									</Link>
									<Badge variant="secondary" className="mt-2">
										<User className="w-3 h-3 mr-1" />
										Siswa
									</Badge>
								</div>

								{/* Creator Bio */}
								{user.bio && (
									<div>
										<h4 className="text-sm font-medium text-gray-900 mb-2">
											Tentang
										</h4>
										<p className="text-gray-600 text-sm leading-relaxed">
											{user.bio}
										</p>
									</div>
								)}

								{/* Project Links */}
								{(project.github || project.video) && (
									<div>
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Links Project
										</h4>
										<div className="space-y-2">
											{project.github && (
												<a
													href={project.github}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-gray-700 hover:text-gray-900 text-sm"
												>
													<Github className="w-4 h-4 mr-2" />
													<span>GitHub Repository</span>
												</a>
											)}
											{project.video && (
												<a
													href={project.video}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-red-600 hover:text-red-700 text-sm"
												>
													<Youtube className="w-4 h-4 mr-2" />
													<span>Video Demo</span>
												</a>
											)}
										</div>
									</div>
								)}

								{/* Social Links */}
								{(user.website ||
									user.github ||
									user.linkedin ||
									user.twitter) && (
									<div>
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Kontak & Sosial
										</h4>
										<div className="space-y-2">
											{user.website && (
												<a
													href={user.website}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
												>
													<Globe className="w-4 h-4 mr-2" />
													<span>Website</span>
												</a>
											)}
											{user.github && (
												<a
													href={`https://github.com/${user.github}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-gray-700 hover:text-gray-900 text-sm"
												>
													<Github className="w-4 h-4 mr-2" />
													<span>GitHub</span>
												</a>
											)}
											{user.linkedin && (
												<a
													href={`https://linkedin.com/in/${user.linkedin}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-blue-700 hover:text-blue-800 text-sm"
												>
													<Linkedin className="w-4 h-4 mr-2" />
													<span>LinkedIn</span>
												</a>
											)}
											{user.twitter && (
												<a
													href={`https://twitter.com/${user.twitter}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-blue-500 hover:text-blue-600 text-sm"
												>
													<Twitter className="w-4 h-4 mr-2" />
													<span>Twitter</span>
												</a>
											)}
										</div>
									</div>
								)}

								{/* View Profile Button */}
								<Link href={`/profile/${user.id}`}>
									<Button className="w-full">
										<ExternalLink className="w-4 h-4 mr-2" />
										Lihat Profile Lengkap
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
