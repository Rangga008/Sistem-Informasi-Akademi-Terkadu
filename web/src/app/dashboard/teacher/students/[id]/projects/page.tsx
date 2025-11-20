"use client";

import { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Eye, AlertCircle } from "lucide-react";
import { getStudentProfile, updateProject, deleteProject } from "@/lib/api";

interface Project {
	id: string;
	title: string;
	description?: string;
	images?: string[];
	github?: string;
	liveLink?: string;
	keywords?: { name: string }[];
	highlight: boolean;
	createdAt?: string;
}

interface Student {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	projects: Project[];
}

export default function StudentProjectsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = use(params);
	const [student, setStudent] = useState<Student | null>(null);
	const [loading, setLoading] = useState(true);
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [formTitle, setFormTitle] = useState("");
	const [formDesc, setFormDesc] = useState("");
	const [formGithub, setFormGithub] = useState("");
	const [formLiveLink, setFormLiveLink] = useState("");
	const [formHighlight, setFormHighlight] = useState(false);
	const [formImages, setFormImages] = useState<string[]>([]);
	const [deleteConfirm, setDeleteConfirm] = useState<{
		open: boolean;
		projectId: string | null;
	}>({
		open: false,
		projectId: null,
	});

	useEffect(() => {
		const loadStudent = async () => {
			try {
				const data = await getStudentProfile(resolvedParams.id);
				setStudent(data);
			} catch (error) {
				console.error("Failed to fetch student:", error);
			} finally {
				setLoading(false);
			}
		};
		loadStudent();
	}, [resolvedParams.id]);

	const fetchStudent = async () => {
		try {
			const data = await getStudentProfile(resolvedParams.id);
			setStudent(data);
		} catch (error) {
			console.error("Failed to fetch student:", error);
		} finally {
			setLoading(false);
		}
	};

	const openEditProject = (project: Project) => {
		setEditingProject(project);
		setFormTitle(project.title);
		setFormDesc(project.description || "");
		setFormGithub(project.github || "");
		setFormLiveLink(project.liveLink || "");
		setFormHighlight(project.highlight);
		setFormImages(project.images || []);
	};

	const handleSaveProject = async () => {
		if (!editingProject) return;
		if (!formTitle.trim()) {
			alert("Judul project wajib diisi");
			return;
		}

		try {
			await updateProject(editingProject.id, {
				title: formTitle,
				description: formDesc,
				github: formGithub,
				liveLink: formLiveLink,
				highlight: formHighlight,
				images: formImages,
			});
			setEditingProject(null);
			fetchStudent();
		} catch (err) {
			console.error("Failed to update project:", err);
			alert("Gagal mengupdate project");
		}
	};

	const handleDeleteProject = async () => {
		const projectId = deleteConfirm.projectId;
		if (!projectId) return;

		try {
			await deleteProject(projectId);
			setDeleteConfirm({ open: false, projectId: null });
			fetchStudent();
		} catch (err) {
			console.error("Failed to delete project:", err);
			alert("Gagal menghapus project");
		}
	};
	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="text-gray-600">Loading...</div>
			</div>
		);
	}

	if (!student) {
		return (
			<Card className="border-red-200 bg-red-50">
				<CardContent className="p-12 text-center">
					<AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
					<p className="text-gray-900 font-semibold">Siswa tidak ditemukan</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold text-gray-900">
					Project - {student.name}
				</h2>
				<p className="text-gray-600 mt-1">{student.email}</p>
				<p className="text-sm text-gray-500 mt-2">
					Total project: {student.projects.length}
				</p>
			</div>

			{/* Projects Table */}
			{student.projects.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>Daftar Project</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="border-b bg-gray-50">
									<tr>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Judul
										</th>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Status
										</th>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											GitHub
										</th>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Live
										</th>
										<th className="text-right py-3 px-4 font-semibold text-gray-700">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody>
									{student.projects.map((project) => (
										<tr key={project.id} className="border-b hover:bg-gray-50">
											<td className="py-3 px-4">
												<div>
													<p className="font-medium text-gray-900">
														{project.title}
													</p>
													{project.description && (
														<p className="text-xs text-gray-600 mt-1 line-clamp-2">
															{project.description}
														</p>
													)}
												</div>
											</td>
											<td className="py-3 px-4">
												{project.highlight ? (
													<Badge className="bg-green-100 text-green-800">
														Highlighted
													</Badge>
												) : (
													<Badge variant="secondary">Pending</Badge>
												)}
											</td>
											<td className="py-3 px-4">
												{project.github ? (
													<a
														href={project.github}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:underline text-xs truncate"
													>
														GitHub
													</a>
												) : (
													<span className="text-gray-400">—</span>
												)}
											</td>
											<td className="py-3 px-4">
												{project.liveLink ? (
													<a
														href={project.liveLink}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 hover:underline text-xs truncate"
													>
														Link
													</a>
												) : (
													<span className="text-gray-400">—</span>
												)}
											</td>
											<td className="py-3 px-4 text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openEditProject(project)}
														title="Edit project"
													>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() =>
															setDeleteConfirm({
																open: true,
																projectId: project.id,
															})
														}
														title="Hapus project"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="p-12 text-center">
						<p className="text-gray-500">Belum ada project</p>
					</CardContent>
				</Card>
			)}

			{/* Edit Project Modal */}
			{editingProject && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<h3 className="text-xl font-semibold mb-6">
							Edit Project: {editingProject.title}
						</h3>

						<div className="space-y-4">
							{/* Title */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Judul *
								</label>
								<Input
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									placeholder="Judul project"
								/>
							</div>

							{/* Description */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Deskripsi
								</label>
								<textarea
									value={formDesc}
									onChange={(e) => setFormDesc(e.target.value)}
									placeholder="Deskripsi project"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={3}
								/>
							</div>

							{/* GitHub URL */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									GitHub URL
								</label>
								<Input
									value={formGithub}
									onChange={(e) => setFormGithub(e.target.value)}
									placeholder="https://github.com/username/repo"
									type="url"
								/>
							</div>

							{/* Live Link */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Live Link
								</label>
								<Input
									value={formLiveLink}
									onChange={(e) => setFormLiveLink(e.target.value)}
									placeholder="https://example.com"
									type="url"
								/>
							</div>

							{/* Highlight */}
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formHighlight}
									onChange={(e) => setFormHighlight(e.target.checked)}
									id="highlight"
									className="w-4 h-4 rounded"
								/>
								<label
									htmlFor="highlight"
									className="text-sm font-medium text-gray-700 cursor-pointer"
								>
									Tandai sebagai Highlighted
								</label>
							</div>

							{/* Current Images */}
							{formImages.length > 0 && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Foto saat ini
									</label>
									<div className="grid grid-cols-2 gap-2">
										{formImages.map((img, idx) => (
											<div key={idx} className="relative">
												<img
													src={`http://localhost:3001${img}`}
													alt={`Project ${idx}`}
													className="w-full h-32 object-cover rounded-lg"
												/>
												<button
													onClick={() =>
														setFormImages(
															formImages.filter((_, i) => i !== idx)
														)
													}
													className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
												>
													✕
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Keywords Display */}
							{editingProject.keywords &&
								editingProject.keywords.length > 0 && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Keywords
										</label>
										<div className="flex flex-wrap gap-2">
											{editingProject.keywords.map((kw) => (
												<Badge key={kw.name} variant="secondary">
													{kw.name}
												</Badge>
											))}
										</div>
										<p className="text-xs text-gray-500 mt-1">
											(Edit keywords tidak tersedia di sini, silakan gunakan
											form project upload)
										</p>
									</div>
								)}
						</div>

						{/* Actions */}
						<div className="flex justify-end gap-2 mt-6 pt-6 border-t">
							<Button variant="ghost" onClick={() => setEditingProject(null)}>
								Batal
							</Button>
							<Button
								onClick={handleSaveProject}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Simpan Perubahan
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 w-full max-w-sm">
						<h3 className="text-lg font-semibold mb-4 text-gray-900">
							Hapus Project
						</h3>
						<p className="text-gray-600 mb-6">
							Apakah Anda yakin ingin menghapus project ini? Tindakan ini tidak
							dapat dibatalkan.
						</p>
						<div className="flex justify-end gap-2">
							<Button
								variant="ghost"
								onClick={() =>
									setDeleteConfirm({ open: false, projectId: null })
								}
							>
								Batal
							</Button>
							<Button variant="destructive" onClick={handleDeleteProject}>
								Hapus
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
