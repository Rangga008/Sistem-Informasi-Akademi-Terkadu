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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Edit3,
	Save,
	X,
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
	Camera,
	User,
	Briefcase,
	Award,
	ChevronLeft,
} from "lucide-react";
import {
	api,
	getCurrentUser,
	getFollowStats,
	getFollowersList,
	getFollowingList,
} from "@/lib/api";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import FollowButton from "@/components/follow-button";
import LikeButton from "@/components/like-button";

interface User {
	id: string;
	name: string;
	email: string;
	bio?: string;
	avatar?: string;
	role: string;
	createdAt: string;
	// Social links (to be added to schema)
	github?: string;
	linkedin?: string;
	twitter?: string;
	website?: string;
	location?: string;
}

interface Skill {
	id: string;
	name: string;
}

interface Project {
	id: string;
	title: string;
	description: string;
	images: string[];
	highlight: boolean;
	keywords: string[];
	createdAt: string;
}

interface ProfileData {
	user: User;
	skills: Skill[];
	projects: Project[];
	isOwnProfile: boolean;
}

export default function ProfilePage() {
	const params = useParams();
	const router = useRouter();
	const userId = params.id as string;

	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		bio: "",
		github: "",
		linkedin: "",
		twitter: "",
		website: "",
		location: "",
	});
	const [followersCount, setFollowersCount] = useState<number>(0);
	const [followingCount, setFollowingCount] = useState<number>(0);
	const [followersOpen, setFollowersOpen] = useState(false);
	const [followingOpen, setFollowingOpen] = useState(false);
	const [followers, setFollowers] = useState<Array<User>>([]);
	const [following, setFollowing] = useState<Array<User>>([]);
	const [listLoading, setListLoading] = useState(false);

	useEffect(() => {
		loadProfile();
	}, [userId]);

	const loadProfile = async () => {
		try {
			setLoading(true);

			// Get current user to check if viewing own profile
			let currentUser = null;
			try {
				currentUser = await getCurrentUser();
			} catch (error) {
				// User not logged in, that's ok
			}

			// Get user profile data
			const [userRes, skillsRes, projectsRes] = await Promise.all([
				api.get(`/users/${userId}`),
				api.get(`/skills?userId=${userId}`),
				api.get(`/projects?userId=${userId}`),
			]);

			const user = userRes.data;
			const skills = skillsRes.data || [];
			const projects = projectsRes.data || [];

			setProfileData({
				user,
				skills,
				projects,
				isOwnProfile: currentUser?.id === userId,
			});

			// Fetch follow stats (public)
			try {
				const stats = await getFollowStats(userId);
				setFollowersCount(stats.followers ?? 0);
				setFollowingCount(stats.following ?? 0);
			} catch {}

			// Initialize edit form
			setEditForm({
				bio: user.bio || "",
				github: user.github || "",
				linkedin: user.linkedin || "",
				twitter: user.twitter || "",
				website: user.website || "",
				location: user.location || "",
			});
		} catch (error) {
			console.error("Failed to load profile:", error);
			router.push("/search");
		} finally {
			setLoading(false);
		}
	};

	const openFollowersDialog = async () => {
		setFollowersOpen(true);
		if (!profileData) return;
		setListLoading(true);
		try {
			const list = await getFollowersList(profileData.user.id);
			setFollowers(list);
		} catch {
			setFollowers([]);
		} finally {
			setListLoading(false);
		}
	};

	const openFollowingDialog = async () => {
		setFollowingOpen(true);
		if (!profileData) return;
		setListLoading(true);
		try {
			const list = await getFollowingList(profileData.user.id);
			setFollowing(list);
		} catch {
			setFollowing([]);
		} finally {
			setListLoading(false);
		}
	};

	const handleSaveProfile = async () => {
		try {
			console.log("Starting profile update...");
			console.log("User ID:", userId);
			console.log("Edit form data:", editForm);
			console.log(
				"API base URL:",
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
			);

			const response = await api.patch(`/users/${userId}`, editForm);
			console.log("Profile update response:", response);

			setEditing(false);
			loadProfile(); // Reload to get updated data
		} catch (error: any) {
			console.error("Failed to update profile:", error);
			console.error("Error response:", error.response);
			console.error("Error status:", error.response?.status);
			console.error("Error data:", error.response?.data);
		}
	};

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			console.log("Starting avatar upload...");
			console.log("File:", file.name, file.size, file.type);
			console.log("User ID:", userId);

			const formData = new FormData();
			formData.append("avatar", file);

			console.log("FormData created, making API call...");
			const response = await api.post(`/users/${userId}/avatar`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			console.log("Avatar upload response:", response);
			loadProfile(); // Reload to get new avatar
		} catch (error: any) {
			console.error("Failed to upload avatar:", error);
			console.error("Error response:", error.response);
			console.error("Error status:", error.response?.status);
			console.error("Error data:", error.response?.data);
		}
	};

	const handleShare = async () => {
		const url = window.location.href;
		const title = `Lihat profile ${profileData?.user.name}`;

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

	const [generatingCV, setGeneratingCV] = useState(false);

	const generateCV = async () => {
		if (!profileData) return;
		setGeneratingCV(true);
		try {
			const payload = {
				user: profileData.user,
				skills: profileData.skills,
				projects: profileData.projects,
			};

			const res = await fetch("/api/generate-cv", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (data.ok && data.html) {
				// Open printable window with generated HTML
				const w = window.open("", "_blank");
				if (w) {
					w.document.write(
						`<!doctype html><html><head><meta charset="utf-8"><title>CV - ${profileData.user.name}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:system-ui, -apple-system, Roboto, 'Segoe UI', Arial; padding:24px">${data.html}<div style="margin-top:24px"><button onclick="window.print()" style="padding:8px 12px;border-radius:6px;background:#2563EB;color:white;border:none;cursor:pointer">Cetak / Simpan PDF</button></div></body></html>`
					);
					w.document.close();
				} else {
					alert("CV generated. Please enable popups to view it.");
				}
			} else {
				console.error("CV generation failed", data);
				alert("Gagal membuat CV. Coba lagi nanti.");
			}
		} catch (err) {
			console.error("generateCV error", err);
			alert("Terjadi kesalahan saat generate CV");
		} finally {
			setGeneratingCV(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
			</div>
		);
	}

	if (!profileData) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Profile tidak ditemukan
					</h2>
					<p className="text-gray-600 mb-4">
						Siswa yang Anda cari tidak tersedia.
					</p>
					<Link href="/search">
						<Button>Kembali ke Pencarian</Button>
					</Link>
				</div>
			</div>
		);
	}

	const { user, skills, projects, isOwnProfile } = profileData;

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
								<ChevronLeft className="w-4 h-4 mr-2" />
								Kembali
							</Button>
							<div className="h-6 w-px bg-gray-300"></div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									{user.name}
								</h1>
								<p className="text-sm text-gray-600">
									@{user.email ? user.email.split("@")[0] : "unknown"}
								</p>
								<div className="flex gap-2 mt-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={openFollowersDialog}
									>
										Pengikut: {followersCount}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={openFollowingDialog}
									>
										Mengikuti: {followingCount}
									</Button>
								</div>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							{isOwnProfile && (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setEditing(!editing)}
										className="flex items-center"
									>
										<Edit3 className="w-4 h-4 mr-2" />
										{editing ? "Batal Edit" : "Edit Profile"}
									</Button>

									<Button
										variant="default"
										size="sm"
										onClick={async () => await generateCV()}
										className="flex items-center"
										id="generate-cv-btn"
										disabled={generatingCV}
									>
										<Award className="w-4 h-4 mr-2" />
										{generatingCV ? "Membuat..." : "Generate CV"}
									</Button>
								</>
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
							{!isOwnProfile && <FollowButton targetUserId={user.id} />}
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Sidebar - Profile Info */}
					<div className="lg:col-span-1">
						<Card className="sticky top-8">
							<CardContent className="p-6">
								{/* Avatar Section */}
								<div className="text-center mb-6">
									<div className="relative inline-block">
										<Avatar className="w-32 h-32 border-4 border-blue-100">
											<AvatarImage
												src={
													user.avatar
														? `http://localhost:3001${user.avatar}`
														: undefined
												}
												alt={user.name}
											/>
											<AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-4xl">
												{user.name ? user.name.charAt(0).toUpperCase() : "?"}
											</AvatarFallback>
										</Avatar>
										{isOwnProfile && editing && (
											<label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
												<Camera className="w-4 h-4" />
												<input
													type="file"
													accept="image/*"
													onChange={handleAvatarUpload}
													className="hidden"
												/>
											</label>
										)}
									</div>
									<h2 className="text-2xl font-bold text-gray-900 mt-4">
										{user.name}
									</h2>
									<Badge variant="secondary" className="mt-2">
										<User className="w-3 h-3 mr-1" />
										Siswa
									</Badge>
								</div>

								{/* Bio Section */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										Tentang
									</h3>
									{editing ? (
										<Textarea
											value={editForm.bio}
											onChange={(e) =>
												setEditForm((prev) => ({
													...prev,
													bio: e.target.value,
												}))
											}
											placeholder="Ceritakan tentang diri Anda..."
											className="w-full"
											rows={4}
										/>
									) : (
										<p className="text-gray-600 leading-relaxed">
											{user.bio || "Belum ada deskripsi."}
										</p>
									)}
								</div>

								{/* Social Links */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										Kontak & Sosial
									</h3>
									<div className="space-y-3">
										{editing ? (
											<>
												<div>
													<Label htmlFor="location">Lokasi</Label>
													<Input
														id="location"
														value={editForm.location}
														onChange={(e) =>
															setEditForm((prev) => ({
																...prev,
																location: e.target.value,
															}))
														}
														placeholder="Jakarta, Indonesia"
													/>
												</div>
												<div>
													<Label htmlFor="website">Website</Label>
													<Input
														id="website"
														value={editForm.website}
														onChange={(e) =>
															setEditForm((prev) => ({
																...prev,
																website: e.target.value,
															}))
														}
														placeholder="https://website.com"
													/>
												</div>
												<div>
													<Label htmlFor="github">GitHub</Label>
													<Input
														id="github"
														value={editForm.github}
														onChange={(e) =>
															setEditForm((prev) => ({
																...prev,
																github: e.target.value,
															}))
														}
														placeholder="username"
													/>
												</div>
												<div>
													<Label htmlFor="linkedin">LinkedIn</Label>
													<Input
														id="linkedin"
														value={editForm.linkedin}
														onChange={(e) =>
															setEditForm((prev) => ({
																...prev,
																linkedin: e.target.value,
															}))
														}
														placeholder="username"
													/>
												</div>
												<div>
													<Label htmlFor="twitter">Twitter</Label>
													<Input
														id="twitter"
														value={editForm.twitter}
														onChange={(e) =>
															setEditForm((prev) => ({
																...prev,
																twitter: e.target.value,
															}))
														}
														placeholder="username"
													/>
												</div>
											</>
										) : (
											<>
												{user.location && (
													<div className="flex items-center text-gray-600">
														<MapPin className="w-4 h-4 mr-2" />
														<span>{user.location}</span>
													</div>
												)}
												{user.website && (
													<a
														href={user.website}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-blue-600 hover:text-blue-700"
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
														className="flex items-center text-gray-700 hover:text-gray-900"
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
														className="flex items-center text-blue-700 hover:text-blue-800"
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
														className="flex items-center text-blue-500 hover:text-blue-600"
													>
														<Twitter className="w-4 h-4 mr-2" />
														<span>Twitter</span>
													</a>
												)}
											</>
										)}
									</div>
								</div>

								{/* Stats */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">
										Statistik
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="text-center p-3 bg-blue-50 rounded-lg">
											<div className="text-2xl font-bold text-blue-600">
												{skills.length}
											</div>
											<div className="text-sm text-gray-600">Skills</div>
										</div>
										<div className="text-center p-3 bg-green-50 rounded-lg">
											<div className="text-2xl font-bold text-green-600">
												{projects.length}
											</div>
											<div className="text-sm text-gray-600">Projects</div>
										</div>
									</div>
									{/* Followers Dialog */}
									<Dialog open={followersOpen} onOpenChange={setFollowersOpen}>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Daftar Pengikut</DialogTitle>
												<DialogDescription>
													Pengguna yang mengikuti {profileData?.user.name}
												</DialogDescription>
											</DialogHeader>
											<div className="max-h-80 overflow-y-auto space-y-3">
												{listLoading ? (
													<div className="text-sm text-gray-500">Memuat...</div>
												) : followers.length > 0 ? (
													followers.map((u) => (
														<Link
															key={u.id}
															href={`/profile/${u.id}`}
															onClick={() => setFollowersOpen(false)}
															className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
														>
															<Avatar className="w-8 h-8">
																<AvatarImage
																	src={
																		u.avatar
																			? `http://localhost:3001${u.avatar}`
																			: undefined
																	}
																	alt={u.name}
																/>
																<AvatarFallback>
																	{u.name?.charAt(0).toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<div>
																<div className="text-sm font-medium">
																	{u.name}
																</div>
																<div className="text-xs text-gray-500">
																	{u.email}
																</div>
															</div>
														</Link>
													))
												) : (
													<div className="text-sm text-gray-500">
														Belum ada pengikut.
													</div>
												)}
											</div>
											<DialogFooter>
												<Button
													variant="outline"
													onClick={() => setFollowersOpen(false)}
												>
													Tutup
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>

									{/* Following Dialog */}
									<Dialog open={followingOpen} onOpenChange={setFollowingOpen}>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Daftar Mengikuti</DialogTitle>
												<DialogDescription>
													Pengguna yang diikuti oleh {profileData?.user.name}
												</DialogDescription>
											</DialogHeader>
											<div className="max-h-80 overflow-y-auto space-y-3">
												{listLoading ? (
													<div className="text-sm text-gray-500">Memuat...</div>
												) : following.length > 0 ? (
													following.map((u) => (
														<Link
															key={u.id}
															href={`/profile/${u.id}`}
															onClick={() => setFollowingOpen(false)}
															className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
														>
															<Avatar className="w-8 h-8">
																<AvatarImage
																	src={
																		u.avatar
																			? `http://localhost:3001${u.avatar}`
																			: undefined
																	}
																	alt={u.name}
																/>
																<AvatarFallback>
																	{u.name?.charAt(0).toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<div>
																<div className="text-sm font-medium">
																	{u.name}
																</div>
																<div className="text-xs text-gray-500">
																	{u.email}
																</div>
															</div>
														</Link>
													))
												) : (
													<div className="text-sm text-gray-500">
														Belum mengikuti siapapun.
													</div>
												)}
											</div>
											<DialogFooter>
												<Button
													variant="outline"
													onClick={() => setFollowingOpen(false)}
												>
													Tutup
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>

								{/* Join Date */}
								<div className="text-sm text-gray-500">
									<Calendar className="w-4 h-4 inline mr-1" />
									Bergabung{" "}
									{new Date(user.createdAt).toLocaleDateString("id-ID", {
										year: "numeric",
										month: "long",
									})}
								</div>

								{/* Edit Actions */}
								{editing && (
									<div className="flex space-x-2 mt-6">
										<Button onClick={handleSaveProfile} className="flex-1">
											<Save className="w-4 h-4 mr-2" />
											Simpan
										</Button>
										<Button
											variant="outline"
											onClick={() => setEditing(false)}
											className="flex-1"
										>
											<X className="w-4 h-4 mr-2" />
											Batal
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Skills Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Award className="w-5 h-5 mr-2" />
									Skills & Kemampuan
								</CardTitle>
								<CardDescription>
									Keahlian yang dikuasai oleh {user.name}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{skills.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{skills.map((skill) => (
											<Badge
												key={skill.id}
												variant="outline"
												className="text-sm py-1 px-3"
											>
												{skill.name}
											</Badge>
										))}
									</div>
								) : (
									<p className="text-gray-500 italic">
										Belum ada skills yang ditambahkan.
									</p>
								)}
							</CardContent>
						</Card>

						{/* Projects Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Briefcase className="w-5 h-5 mr-2" />
									Projects
								</CardTitle>
								<CardDescription>
									Portofolio project yang telah dikerjakan
								</CardDescription>
							</CardHeader>
							<CardContent>
								{projects.length > 0 ? (
									<div className="grid gap-6">
										{projects
											.sort((a, b) => {
												// Highlight projects first, then by creation date (newest first)
												if (a.highlight && !b.highlight) return -1;
												if (!a.highlight && b.highlight) return 1;
												return (
													new Date(b.createdAt).getTime() -
													new Date(a.createdAt).getTime()
												);
											})
											.slice(0, 5) // Limit to 5 projects
											.map((project) => (
												<div
													key={project.id}
													className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
												>
													<div className="flex items-start justify-between mb-4">
														<div className="flex-1">
															<div className="flex items-center mb-2">
																<h3 className="text-xl font-semibold text-gray-900 mr-3">
																	{project.title}
																</h3>
																{project.highlight && (
																	<Badge className="bg-yellow-100 text-yellow-800">
																		<Star className="w-3 h-3 mr-1 fill-current" />
																		Highlight
																	</Badge>
																)}
															</div>
															<p className="text-gray-600 mb-3">
																{project.description}
															</p>
															<div className="flex flex-wrap gap-2 mb-3">
																{project.keywords.map((keyword, index) => (
																	<Badge
																		key={index}
																		variant="outline"
																		className="text-xs"
																	>
																		{keyword}
																	</Badge>
																))}
															</div>
															<div className="text-sm text-gray-500">
																<Calendar className="w-4 h-4 inline mr-1" />
																{new Date(project.createdAt).toLocaleDateString(
																	"id-ID",
																	{
																		year: "numeric",
																		month: "short",
																		day: "numeric",
																	}
																)}
															</div>
														</div>
													</div>

													{/* Project Images */}
													{project.images && project.images.length > 0 && (
														<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
															{project.images
																.slice(0, 6)
																.map((image, index) => (
																	<div
																		key={index}
																		className="aspect-video bg-gray-200 rounded-lg overflow-hidden"
																	>
																		<img
																			src={`http://localhost:3001${image}`}
																			alt={`${project.title} - Image ${
																				index + 1
																			}`}
																			className="w-full h-full object-cover"
																		/>
																	</div>
																))}
														</div>
													)}

													{/* Actions */}
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-4 text-sm text-gray-500">
															<span className="flex items-center">
																<Eye className="w-4 h-4 mr-1" />
																Lihat Detail
															</span>
														</div>
														<div className="flex items-center space-x-2">
															<LikeButton projectId={project.id} />
															<Button variant="outline" size="sm">
																<Share2 className="w-4 h-4 mr-1" />
																Bagikan
															</Button>
															<Link href={`/project/${project.id}`}>
																<Button size="sm">
																	<ExternalLink className="w-4 h-4 mr-1" />
																	Lihat Project
																</Button>
															</Link>
														</div>
													</div>
												</div>
											))}
									</div>
								) : (
									<div className="text-center py-12">
										<Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
										<p className="text-gray-500">
											Belum ada project yang ditampilkan.
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
