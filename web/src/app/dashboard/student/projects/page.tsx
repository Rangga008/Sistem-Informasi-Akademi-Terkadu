"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Plus,
	Edit3,
	Trash2,
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
	ChevronLeft,
	Award,
	Briefcase,
} from "lucide-react";
import { api, getCurrentUser } from "@/lib/api";
import UnhighlightModal from "@/components/unhighlight-modal";
import StatusModal from "@/components/status-modal";
import ConfirmModal from "@/components/confirm-modal";

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

interface Skill {
	id: string;
	name: string;
}

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function StudentProjectsPage() {
	const [user, setUser] = useState<User | null>(null);
	const [projects, setProjects] = useState<Project[]>([]);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		images: [] as string[],
		highlight: false,
		keywords: [] as string[],
		github: "",
		video: "",
	});
	const [keywordInput, setKeywordInput] = useState("");
	const [newSkill, setNewSkill] = useState("");
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [unhighlightModalOpen, setUnhighlightModalOpen] = useState(false);
	const [currentHighlights, setCurrentHighlights] = useState<Project[]>([]);
	const [pendingHighlightProjectId, setPendingHighlightProjectId] = useState<
		string | null
	>(null);
	const [statusModal, setStatusModal] = useState({
		open: false,
		title: "",
		description: "",
	});
	const [deleteModal, setDeleteModal] = useState({
		open: false,
		projectId: "",
	});
	const [deleting, setDeleting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		checkAuthAndLoadData();
	}, []);

	const checkAuthAndLoadData = async () => {
		try {
			const userData = await getCurrentUser();
			if (userData.role !== "STUDENT") {
				router.push("/dashboard/teacher");
				return;
			}
			setUser(userData);
			loadData(userData.id);
		} catch (error) {
			console.error("Auth check failed:", error);
			router.push("/login");
		} finally {
			setLoading(false);
		}
	};

	const loadData = async (userId: string) => {
		try {
			const [skillsRes, projectsRes] = await Promise.all([
				api.get(`/skills?userId=${userId}`),
				api.get(`/projects?userId=${userId}`),
			]);
			setSkills(skillsRes.data || []);
			setProjects(projectsRes.data || []);
		} catch (error) {
			console.error("Failed to load data:", error);
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			images: [],
			highlight: false,
			keywords: [],
			github: "",
			video: "",
		});
		setKeywordInput("");
		setSelectedImages([]);
		setEditingProject(null);
		setShowCreateForm(false);
	};

	const handleCreateProject = () => {
		resetForm();
		setShowCreateForm(true);
	};

	const handleEditProject = (project: Project) => {
		setFormData({
			title: project.title,
			description: project.description,
			images: project.images,
			highlight: project.highlight,
			keywords: project.keywords,
			github: project.github || "",
			video: project.video || "",
		});
		setEditingProject(project);
		setShowCreateForm(true);
	};

	const handleSaveProject = async () => {
		if (saving) return; // prevent double submit

		// Client-side duplicate title check for better UX
		const normalizedTitle = formData.title.trim().toLowerCase();
		if (!normalizedTitle) {
			setStatusModal({
				open: true,
				title: "Judul wajib diisi",
				description: "Silakan isi judul project terlebih dahulu.",
			});
			return;
		}
		if (!editingProject) {
			const dupe = projects.some(
				(p) => p.title.trim().toLowerCase() === normalizedTitle
			);
			if (dupe) {
				setStatusModal({
					open: true,
					title: "Judul sudah digunakan",
					description: "Judul project sudah ada. Gunakan judul lain.",
				});
				return;
			}
		} else {
			const original = editingProject.title.trim().toLowerCase();
			if (normalizedTitle !== original) {
				const dupe = projects.some(
					(p) =>
						p.id !== editingProject.id &&
						p.title.trim().toLowerCase() === normalizedTitle
				);
				if (dupe) {
					setStatusModal({
						open: true,
						title: "Judul sudah digunakan",
						description: "Judul project sudah ada. Gunakan judul lain.",
					});
					return;
				}
			}
		}

		setSaving(true);
		try {
			const formDataToSend = new FormData();
			formDataToSend.append("title", formData.title);
			formDataToSend.append("description", formData.description);
			formDataToSend.append("highlight", formData.highlight.toString());
			formDataToSend.append("keywords", JSON.stringify(formData.keywords));
			formDataToSend.append("github", formData.github);
			formDataToSend.append("video", formData.video);

			// Add images as files
			selectedImages.forEach((file, index) => {
				formDataToSend.append("images", file);
			});

			console.log("Saving project:", {
				editing: !!editingProject,
				projectId: editingProject?.id,
				userId: user?.id,
				formData: formData,
				selectedImagesCount: selectedImages.length,
			});

			if (editingProject) {
				console.log("Updating project:", editingProject.id);
				await api.patch(`/projects/${editingProject.id}`, formDataToSend, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
			} else {
				console.log("Creating new project for user:", user?.id);
				await api.post(`/projects/${user?.id}`, formDataToSend, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
			}

			loadData(user!.id);
			resetForm();
		} catch (error: any) {
			console.error("Failed to save project:", error);
			// Check if it's the highlight limit error
			if (
				error?.response?.status === 403 &&
				error?.response?.data?.currentHighlights
			) {
				setCurrentHighlights(error.response.data.currentHighlights);
				setPendingHighlightProjectId(editingProject?.id || null);
				setUnhighlightModalOpen(true);
			} else if (error?.response?.status === 409) {
				setStatusModal({
					open: true,
					title: "Judul sudah digunakan",
					description: "Judul project sudah ada. Gunakan judul lain.",
				});
			} else {
				setStatusModal({
					open: true,
					title: "Gagal menyimpan project",
					description: String(
						error?.response?.data?.message || error?.message || "Unknown error"
					),
				});
			}
		} finally {
			setSaving(false);
		}
	};

	const openDeleteConfirm = (projectId: string) => {
		setDeleteModal({ open: true, projectId });
	};

	const confirmDeleteProject = async () => {
		if (!deleteModal.projectId || !user) return;
		setDeleting(true);
		try {
			await api.delete(`/projects/${deleteModal.projectId}`);
			setDeleteModal({ open: false, projectId: "" });
			await loadData(user.id);
		} catch (error: any) {
			console.error("Failed to delete project:", error);
			setStatusModal({
				open: true,
				title: "Gagal menghapus project",
				description: String(
					error?.response?.data?.message || error?.message || "Unknown error"
				),
			});
		} finally {
			setDeleting(false);
		}
	};

	const handleAddSkill = async () => {
		if (!newSkill.trim() || !user) return;

		try {
			await api.post(`/skills/${user.id}`, { name: newSkill });
			setNewSkill("");
			loadData(user.id);
		} catch (error) {
			console.error("Failed to add skill:", error);
		}
	};

	const handleDeleteSkill = async (skillId: string) => {
		if (!user) return;

		try {
			await api.delete(`/skills/${skillId}`);
			loadData(user.id);
		} catch (error) {
			console.error("Failed to delete skill:", error);
		}
	};

	const addKeyword = () => {
		if (
			keywordInput.trim() &&
			!formData.keywords.includes(keywordInput.trim())
		) {
			setFormData((prev) => ({
				...prev,
				keywords: [...prev.keywords, keywordInput.trim()],
			}));
			setKeywordInput("");
		}
	};

	const removeKeyword = (keyword: string) => {
		setFormData((prev) => ({
			...prev,
			keywords: prev.keywords.filter((k) => k !== keyword),
		}));
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setSelectedImages((prev) => [...prev, ...files]);
	};

	const removeImage = (index: number) => {
		setSelectedImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUnhighlight = async (projectId: string) => {
		await api.patch(`/projects/${projectId}`, { highlight: false });
	};

	const handleUnhighlightComplete = async () => {
		// After unhighlighting, retry save
		if (user) {
			await loadData(user.id);
			// Retry the save operation
			await handleSaveProject();
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => router.push("/dashboard/student")}
								className="flex items-center"
							>
								<ChevronLeft className="w-4 h-4 mr-2" />
								Kembali ke Dashboard
							</Button>
							<div className="h-6 w-px bg-gray-300"></div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Kelola Portofolio
								</h1>
								<p className="text-sm text-gray-600">
									Kelola skills dan projects Anda
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Skills Section */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Award className="w-5 h-5 mr-2" />
							Skills
						</CardTitle>
						<CardDescription>Tambahkan skills yang Anda kuasai</CardDescription>
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
							<Button
								onClick={handleCreateProject}
								className="flex items-center space-x-2"
							>
								<Plus className="w-4 h-4" />
								<span>Tambah Project</span>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{/* Create/Edit Form */}
						{showCreateForm && (
							<div className="mb-8 p-6 bg-gray-50 rounded-lg">
								<h3 className="text-lg font-semibold mb-4">
									{editingProject ? "Edit Project" : "Tambah Project Baru"}
								</h3>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="title">Judul Project *</Label>
											<Input
												id="title"
												value={formData.title}
												onChange={(e) =>
													setFormData((prev) => ({
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
												checked={formData.highlight}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														highlight: e.target.checked,
													}))
												}
												className="rounded"
												disabled={(() => {
													const count = projects.filter(
														(p) => p.highlight
													).length;
													return editingProject?.highlight ? false : count >= 3;
												})()}
											/>
											<label
												htmlFor="highlight"
												className="text-sm text-gray-600"
											>
												Project Highlight
											</label>
										</div>
										{(() => {
											const count = projects.filter((p) => p.highlight).length;
											const disabled = editingProject?.highlight
												? false
												: count >= 3;
											return disabled ? (
												<p className="text-xs text-amber-600 mt-1">
													Maksimal 3 project highlight. Unhighlight salah satu
													untuk menambah.
												</p>
											) : null;
										})()}
									</div>

									<div>
										<Label htmlFor="description">Deskripsi Project *</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												setFormData((prev) => ({
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
												value={formData.github}
												onChange={(e) =>
													setFormData((prev) => ({
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
												value={formData.video}
												onChange={(e) =>
													setFormData((prev) => ({
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
											{formData.keywords.map((keyword) => (
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
												onChange={handleImageSelect}
												className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
											/>
											<span className="text-sm text-gray-500">
												{selectedImages.length} gambar dipilih
											</span>
										</div>
										{selectedImages.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-2">
												{selectedImages.map((image, index) => (
													<div key={index} className="relative">
														<img
															src={URL.createObjectURL(image)}
															alt={`Preview ${index + 1}`}
															className="w-16 h-16 object-cover rounded"
														/>
														<button
															onClick={() => removeImage(index)}
															className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
														>
															<X className="w-3 h-3" />
														</button>
													</div>
												))}
											</div>
										)}
									</div>

									<div className="flex justify-end space-x-2">
										<Button variant="outline" onClick={resetForm}>
											Batal
										</Button>
										<Button onClick={handleSaveProject} disabled={saving}>
											{saving
												? "Menyimpan..."
												: editingProject
												? "Update"
												: "Simpan"}
										</Button>
									</div>
								</div>
							</div>
						)}

						{/* Projects Table */}
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-gray-200">
										<th className="text-left py-3 px-4 font-semibold">
											Project
										</th>
										<th className="text-left py-3 px-4 font-semibold">
											Status
										</th>
										<th className="text-left py-3 px-4 font-semibold">Links</th>
										<th className="text-left py-3 px-4 font-semibold">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{projects.map((project) => (
										<tr
											key={project.id}
											className="border-b border-gray-100 hover:bg-gray-50"
										>
											<td className="py-4 px-4">
												<div className="flex items-center space-x-3">
													{project.thumbnail ? (
														<img
															src={`http://localhost:3001${project.thumbnail}`}
															alt={project.title}
															className="w-12 h-12 object-cover rounded"
														/>
													) : project.images && project.images.length > 0 ? (
														<img
															src={`http://localhost:3001${project.images[0]}`}
															alt={project.title}
															className="w-12 h-12 object-cover rounded"
														/>
													) : (
														<div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
															<ImageIcon className="w-6 h-6 text-gray-400" />
														</div>
													)}
													<div>
														<h4 className="font-medium text-gray-900">
															{project.title}
														</h4>
														<p className="text-sm text-gray-600 line-clamp-1">
															{project.description}
														</p>
														<div className="flex flex-wrap gap-1 mt-1">
															{project.keywords
																.slice(0, 2)
																.map((keyword, index) => (
																	<Badge
																		key={index}
																		variant="outline"
																		className="text-xs"
																	>
																		{keyword}
																	</Badge>
																))}
															{project.keywords.length > 2 && (
																<span className="text-xs text-gray-500">
																	+{project.keywords.length - 2}
																</span>
															)}
														</div>
													</div>
												</div>
											</td>
											<td className="py-4 px-4">
												{project.highlight && (
													<Badge className="bg-yellow-100 text-yellow-800">
														<Star className="w-3 h-3 mr-1 fill-current" />
														Highlight
													</Badge>
												)}
											</td>
											<td className="py-4 px-4">
												<div className="flex space-x-2">
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
											</td>
											<td className="py-4 px-4">
												<div className="flex items-center space-x-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleEditProject(project)}
														className="flex items-center"
													>
														<Edit3 className="w-4 h-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => openDeleteConfirm(project.id)}
														className="text-red-600 hover:text-red-700 hover:border-red-300"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
													<Link href={`/project/${project.id}`}>
														<Button variant="outline" size="sm">
															<Eye className="w-4 h-4" />
														</Button>
													</Link>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{projects.length === 0 && !showCreateForm && (
							<div className="text-center py-12">
								<Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-500">
									Belum ada project yang ditambahkan.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
			<UnhighlightModal
				open={unhighlightModalOpen}
				onOpenChange={setUnhighlightModalOpen}
				currentHighlights={currentHighlights}
				onUnhighlight={handleUnhighlight}
				onComplete={handleUnhighlightComplete}
			/>
			wrd
			<ConfirmModal
				open={deleteModal.open}
				onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
				title="Hapus Project"
				description="Apakah Anda yakin ingin menghapus project ini? Tindakan ini tidak dapat dibatalkan."
				confirmText="Hapus"
				cancelText="Batal"
				onConfirm={confirmDeleteProject}
				loading={deleting}
			/>
			<StatusModal
				open={statusModal.open}
				onOpenChange={(open) => setStatusModal((prev) => ({ ...prev, open }))}
				title={statusModal.title}
				description={statusModal.description}
			/>
		</div>
	);
}
