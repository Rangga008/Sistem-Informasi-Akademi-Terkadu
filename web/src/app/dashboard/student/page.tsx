"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	Plus,
	Star,
	Eye,
	Heart,
	Share2,
	ExternalLink,
	Upload,
	X,
	Image as ImageIcon,
	Link as LinkIcon,
	Github,
	Youtube,
	Globe,
	Award,
	Briefcase,
	ChevronRight,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";

interface Skill {
	id: string;
	name: string;
}

interface Project {
	id: string;
	title: string;
	description: string;
	images: string[];
	thumbnail?: string;
	highlight: boolean;
	keywords: string[];
	github?: string;
	video?: string;
	createdAt: string;
}

interface User {
	id: string;
	email: string;
	name: string;
	role: string;
}

export default function StudentDashboard() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [newSkill, setNewSkill] = useState("");
	const [showProjectForm, setShowProjectForm] = useState(false);

	const [projectForm, setProjectForm] = useState({
		title: "",
		description: "",
		images: [] as File[],
		highlight: false,
		keywords: [] as string[],
		github: "",
		video: "",
	});
	const [keywordInput, setKeywordInput] = useState("");

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return;
			}

			const userData = await getCurrentUser();
			if (userData.role !== "STUDENT") {
				router.push("/login");
				return;
			}

			setUser(userData);
			fetchData(userData.id);
		} catch (error) {
			console.error("Auth check failed:", error);
			router.push("/login");
		}
	};

	const fetchData = async (userId: string) => {
		try {
			const [skillsRes, projectsRes] = await Promise.all([
				api.get(`/skills?userId=${userId}`),
				api.get(`/projects?userId=${userId}`),
			]);
			setSkills(skillsRes.data);
			setProjects(projectsRes.data);
		} catch (error) {
			console.error("Failed to fetch data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddSkill = async () => {
		if (!newSkill.trim() || !user) return;

		try {
			await api.post(`/skills/${user.id}`, { name: newSkill });
			setNewSkill("");
			fetchData(user.id);
		} catch (error) {
			console.error("Failed to add skill:", error);
		}
	};

	const handleDeleteSkill = async (skillId: string) => {
		if (!user) return;

		try {
			await api.delete(`/skills/${skillId}`);
			fetchData(user.id);
		} catch (error) {
			console.error("Failed to delete skill:", error);
		}
	};

	const resetProjectForm = () => {
		setProjectForm({
			title: "",
			description: "",
			images: [],
			highlight: false,
			keywords: [],
			github: "",
			video: "",
		});
		setKeywordInput("");
		setShowProjectForm(false);
	};

	const handleCreateProject = () => {
		resetProjectForm();
		setShowProjectForm(true);
	};

	const handleSaveProject = async () => {
		try {
			const formData = new FormData();

			// Add text fields
			formData.append("title", projectForm.title);
			formData.append("description", projectForm.description);
			formData.append("highlight", projectForm.highlight.toString());
			formData.append("keywords", JSON.stringify(projectForm.keywords));
			formData.append("github", projectForm.github);
			formData.append("video", projectForm.video);

			// Add image files
			projectForm.images.forEach((file, index) => {
				formData.append("images", file);
			});

			await api.post(`/projects/${user?.id}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			fetchData(user!.id);
			resetProjectForm();
		} catch (error) {
			console.error("Failed to save project:", error);
		}
	};

	const addKeyword = () => {
		if (
			keywordInput.trim() &&
			!projectForm.keywords.includes(keywordInput.trim())
		) {
			setProjectForm((prev) => ({
				...prev,
				keywords: [...prev.keywords, keywordInput.trim()],
			}));
			setKeywordInput("");
		}
	};

	const removeKeyword = (keyword: string) => {
		setProjectForm((prev) => ({
			...prev,
			keywords: prev.keywords.filter((k) => k !== keyword),
		}));
	};

	const removeImage = (index: number) => {
		setProjectForm((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="max-w-7xl mx-auto p-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
					<p className="text-gray-600 mt-2">Kelola skills dan projects Anda</p>
				</div>

				{/* Skills Section */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center">
									<Award className="w-5 h-5 mr-2" />
									Skills
								</CardTitle>
								<CardDescription>
									Tambahkan skills yang Anda kuasai
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => router.push("/dashboard/student/projects")}
							>
								Kelola Lengkap
								<ChevronRight className="w-4 h-4 ml-1" />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								placeholder="Tambah skill baru"
								value={newSkill}
								onChange={(e) => setNewSkill(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
							/>
							<Button onClick={handleAddSkill}>Tambah</Button>
						</div>

						<div className="flex flex-wrap gap-2">
							{skills.map((skill) => (
								<div
									key={skill.id}
									className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full"
								>
									<span>{skill.name}</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDeleteSkill(skill.id)}
										className="h-4 w-4 p-0 hover:bg-red-100"
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Projects Section */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center">
									<Briefcase className="w-5 h-5 mr-2" />
									Projects
								</CardTitle>
								<CardDescription>
									Kelola projects portofolio Anda
								</CardDescription>
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => router.push("/dashboard/student/projects")}
								>
									Kelola Lengkap
									<ChevronRight className="w-4 h-4 ml-1" />
								</Button>
								<Button onClick={handleCreateProject} size="sm">
									<Plus className="w-4 h-4 mr-1" />
									Tambah Project
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{/* Quick Add Project Form */}
						{showProjectForm && (
							<div className="mb-8 p-6 bg-gray-50 rounded-lg">
								<h3 className="text-lg font-semibold mb-4">
									Tambah Project Baru
								</h3>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="title">Judul Project *</Label>
											<Input
												id="title"
												value={projectForm.title}
												onChange={(e) =>
													setProjectForm((prev) => ({
														...prev,
														title: e.target.value,
													}))
												}
												placeholder="Masukkan judul project"
											/>
										</div>
										<div className="flex items-center space-x-2">
											<input
												type="checkbox"
												id="highlight"
												checked={projectForm.highlight}
												onChange={(e) =>
													setProjectForm((prev) => ({
														...prev,
														highlight: e.target.checked,
													}))
												}
												className="rounded"
											/>
											<label
												htmlFor="highlight"
												className="text-sm text-gray-600"
											>
												Project Highlight
											</label>
										</div>
									</div>

									<div>
										<Label htmlFor="description">Deskripsi Project *</Label>
										<Textarea
											id="description"
											value={projectForm.description}
											onChange={(e) =>
												setProjectForm((prev) => ({
													...prev,
													description: e.target.value,
												}))
											}
											placeholder="Jelaskan project Anda secara detail..."
											rows={3}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="github">GitHub URL</Label>
											<Input
												id="github"
												value={projectForm.github}
												onChange={(e) =>
													setProjectForm((prev) => ({
														...prev,
														github: e.target.value,
													}))
												}
												placeholder="https://github.com/username/repo"
											/>
										</div>
										<div>
											<Label htmlFor="video">Video URL</Label>
											<Input
												id="video"
												value={projectForm.video}
												onChange={(e) =>
													setProjectForm((prev) => ({
														...prev,
														video: e.target.value,
													}))
												}
												placeholder="https://youtube.com/watch?v=..."
											/>
										</div>
									</div>

									<div>
										<Label>Keywords</Label>
										<div className="flex space-x-2">
											<Input
												value={keywordInput}
												onChange={(e) => setKeywordInput(e.target.value)}
												placeholder="Tambah keyword..."
												onKeyPress={(e) => e.key === "Enter" && addKeyword()}
											/>
											<Button
												type="button"
												onClick={addKeyword}
												variant="outline"
											>
												Tambah
											</Button>
										</div>
										<div className="flex flex-wrap gap-2 mt-2">
											{projectForm.keywords.map((keyword) => (
												<Badge
													key={keyword}
													variant="secondary"
													className="flex items-center space-x-1"
												>
													<span>{keyword}</span>
													<X
														className="w-3 h-3 cursor-pointer hover:text-red-500"
														onClick={() => removeKeyword(keyword)}
													/>
												</Badge>
											))}
										</div>
									</div>

									<div>
										<Label>Gambar Project</Label>
										<div className="flex items-center space-x-2">
											<input
												type="file"
												multiple
												accept="image/*"
												onChange={(e) => {
													const files = Array.from(e.target.files || []);
													setProjectForm((prev) => ({
														...prev,
														images: [...prev.images, ...files],
													}));
												}}
												className="hidden"
												id="image-upload"
											/>
											<label
												htmlFor="image-upload"
												className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
											>
												<Upload className="w-4 h-4" />
												<span>Pilih Gambar</span>
											</label>
											<span className="text-sm text-gray-500">
												{projectForm.images.length} gambar dipilih
											</span>
										</div>
										{projectForm.images.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-2">
												{projectForm.images.map((file, index) => (
													<div key={index} className="relative">
														<img
															src={URL.createObjectURL(file)}
															alt={`Preview ${index + 1}`}
															className="w-16 h-16 object-cover rounded border"
														/>
														<Button
															type="button"
															variant="destructive"
															size="sm"
															className="absolute -top-2 -right-2 w-6 h-6 p-0"
															onClick={() => removeImage(index)}
														>
															<X className="w-3 h-3" />
														</Button>
													</div>
												))}
											</div>
										)}
									</div>

									<div className="flex justify-end space-x-2">
										<Button variant="outline" onClick={resetProjectForm}>
											Batal
										</Button>
										<Button onClick={handleSaveProject}>Simpan</Button>
									</div>
								</div>
							</div>
						)}

						{/* Projects Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{projects.slice(0, 6).map((project) => (
								<Card
									key={project.id}
									className="hover:shadow-lg transition-shadow"
								>
									{/* Project Image */}
									{project.thumbnail ? (
										<div className="relative h-48 bg-gray-200 overflow-hidden rounded-t-lg">
											<img
												src={`http://localhost:3001${project.thumbnail}`}
												alt={project.title}
												className="w-full h-full object-cover"
											/>
											{project.highlight && (
												<div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
													<Star className="w-3 h-3 mr-1 fill-current" />
													Highlight
												</div>
											)}
										</div>
									) : project.images && project.images.length > 0 ? (
										<div className="relative h-48 bg-gray-200 overflow-hidden rounded-t-lg">
											<img
												src={`http://localhost:3001${project.images[0]}`}
												alt={project.title}
												className="w-full h-full object-cover"
											/>
											{project.highlight && (
												<div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
													<Star className="w-3 h-3 mr-1 fill-current" />
													Highlight
												</div>
											)}
										</div>
									) : (
										<div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center rounded-t-lg">
											<ImageIcon className="w-12 h-12 text-blue-400" />
										</div>
									)}

									<CardContent className="p-6">
										<div className="flex items-start justify-between mb-3">
											<div className="flex-1 min-w-0">
												<h3 className="text-lg font-semibold text-gray-900 mb-1">
													{project.title}
												</h3>
												<p className="text-sm text-gray-600 mb-2 line-clamp-2">
													{project.description}
												</p>
											</div>
										</div>

										{/* Keywords */}
										<div className="flex flex-wrap gap-1 mb-4">
											{project.keywords.slice(0, 3).map((keyword, index) => (
												<Badge
													key={index}
													variant="outline"
													className="text-xs"
												>
													{keyword}
												</Badge>
											))}
											{project.keywords.length > 3 && (
												<Badge variant="outline" className="text-xs">
													+{project.keywords.length - 3}
												</Badge>
											)}
										</div>

										{/* Links */}
										{(project.github || project.video) && (
											<div className="flex space-x-2 mb-4">
												{project.github && (
													<a
														href={project.github}
														target="_blank"
														rel="noopener noreferrer"
														className="text-gray-600 hover:text-gray-900"
													>
														<Github className="w-4 h-4" />
													</a>
												)}
												{project.video && (
													<a
														href={project.video}
														target="_blank"
														rel="noopener noreferrer"
														className="text-gray-600 hover:text-gray-900"
													>
														<Youtube className="w-4 h-4" />
													</a>
												)}
											</div>
										)}

										{/* Actions */}
										<div className="flex items-center justify-between">
											<Button
												variant="outline"
												size="sm"
												onClick={() => router.push(`/project/${project.id}`)}
												className="flex items-center"
											>
												<Eye className="w-4 h-4 mr-1" />
												Lihat
											</Button>

											<div className="flex items-center space-x-2"></div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{projects.length === 0 && !showProjectForm && (
							<div className="text-center py-12">
								<Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-500 mb-4">
									Belum ada project yang ditambahkan.
								</p>
								<Button onClick={handleCreateProject}>
									<Plus className="w-4 h-4 mr-2" />
									Tambah Project Pertama
								</Button>
							</div>
						)}

						{projects.length > 6 && (
							<div className="text-center mt-6">
								<Button
									variant="outline"
									onClick={() => router.push("/dashboard/student/projects")}
								>
									Lihat Semua Projects ({projects.length})
									<ChevronRight className="w-4 h-4 ml-1" />
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
