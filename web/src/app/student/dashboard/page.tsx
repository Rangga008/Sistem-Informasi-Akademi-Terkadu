"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Star, Upload, X } from "lucide-react";

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
}

interface StudentProfile {
	id: string;
	name: string;
	email: string;
	bio?: string;
	avatar?: string;
	skills: Skill[];
	projects: Project[];
}

export default function StudentDashboard() {
	const [profile, setProfile] = useState<StudentProfile | null>(null);
	const [loading, setLoading] = useState(true);

	// Form states
	const [newSkill, setNewSkill] = useState("");
	const [newProject, setNewProject] = useState({
		title: "",
		description: "",
		keywords: "",
		highlight: false,
	});
	const [selectedImages, setSelectedImages] = useState<File[]>([]);

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			// TODO: Replace with actual API call
			const response = await fetch("/api/student/profile");
			const data = await response.json();
			setProfile(data);
		} catch (error) {
			console.error("Failed to fetch profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddSkill = async () => {
		if (!newSkill.trim()) return;

		try {
			// TODO: Replace with actual API call
			await fetch("/api/student/skills", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newSkill }),
			});
			setNewSkill("");
			fetchProfile();
		} catch (error) {
			console.error("Failed to add skill:", error);
		}
	};

	const handleAddProject = async () => {
		if (!newProject.title.trim() || !newProject.description.trim()) return;

		const formData = new FormData();
		formData.append("title", newProject.title);
		formData.append("description", newProject.description);
		formData.append("keywords", newProject.keywords);
		formData.append("highlight", newProject.highlight.toString());

		selectedImages.forEach((image, index) => {
			formData.append(`images`, image);
		});

		try {
			// TODO: Replace with actual API call
			await fetch("/api/student/projects", {
				method: "POST",
				body: formData,
			});

			setNewProject({
				title: "",
				description: "",
				keywords: "",
				highlight: false,
			});
			setSelectedImages([]);
			fetchProfile();
		} catch (error) {
			console.error("Failed to add project:", error);
		}
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setSelectedImages((prev) => [...prev, ...files]);
	};

	const removeImage = (index: number) => {
		setSelectedImages((prev) => prev.filter((_, i) => i !== index));
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Profil tidak ditemukan
					</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Dashboard Siswa
						</h1>
						<p className="text-gray-600 mt-2">
							Kelola profil, skills, dan projects Anda
						</p>
					</div>

					<Button variant="outline" asChild>
						<a href={`/profile/${profile.id}`}>Lihat Profil Publik</a>
					</Button>
				</div>

				{/* Profile Overview */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Profil Anda</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
								{profile.avatar ? (
									<img
										src={profile.avatar}
										alt={profile.name}
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<span className="text-2xl font-bold text-gray-600">
										{profile.name.charAt(0).toUpperCase()}
									</span>
								)}
							</div>
							<div>
								<h3 className="text-xl font-semibold">{profile.name}</h3>
								<p className="text-gray-600">{profile.email}</p>
								{profile.bio && (
									<p className="text-gray-700 mt-1">{profile.bio}</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Skills Section */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Skills</CardTitle>
							<Dialog>
								<DialogTrigger asChild>
									<Button size="sm">
										<Plus className="w-4 h-4 mr-2" />
										Tambah
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Tambah Skill Baru</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										<Input
											placeholder="Nama skill"
											value={newSkill}
											onChange={(e) => setNewSkill(e.target.value)}
										/>
										<Button onClick={handleAddSkill} className="w-full">
											Tambah Skill
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{profile.skills.map((skill) => (
									<Badge key={skill.id} variant="secondary" className="text-sm">
										{skill.name}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Projects Section */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Projects</CardTitle>
							<Dialog>
								<DialogTrigger asChild>
									<Button size="sm">
										<Plus className="w-4 h-4 mr-2" />
										Tambah
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle>Tambah Project Baru</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										<Input
											placeholder="Judul project"
											value={newProject.title}
											onChange={(e) =>
												setNewProject((prev) => ({
													...prev,
													title: e.target.value,
												}))
											}
										/>
										<Textarea
											placeholder="Deskripsi project"
											value={newProject.description}
											onChange={(e) =>
												setNewProject((prev) => ({
													...prev,
													description: e.target.value,
												}))
											}
										/>
										<Input
											placeholder="Keywords (pisahkan dengan koma)"
											value={newProject.keywords}
											onChange={(e) =>
												setNewProject((prev) => ({
													...prev,
													keywords: e.target.value,
												}))
											}
										/>

										<div className="flex items-center space-x-2">
											<input
												type="checkbox"
												id="highlight"
												checked={newProject.highlight}
												onChange={(e) =>
													setNewProject((prev) => ({
														...prev,
														highlight: e.target.checked,
													}))
												}
											/>
											<label htmlFor="highlight" className="text-sm">
												Tandai sebagai highlight
											</label>
										</div>

										<div>
											<label className="block text-sm font-medium mb-2">
												Upload Gambar
											</label>
											<input
												type="file"
												multiple
												accept="image/*"
												onChange={handleImageSelect}
												className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
											/>
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

										<Button onClick={handleAddProject} className="w-full">
											Tambah Project
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{profile.projects.map((project) => (
									<div key={project.id} className="border rounded-lg p-4">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<h4 className="font-medium">{project.title}</h4>
													{project.highlight && (
														<Badge className="bg-yellow-500 text-white">
															<Star className="w-3 h-3 mr-1" />
															Highlight
														</Badge>
													)}
												</div>
												<p className="text-sm text-gray-600 mb-2 line-clamp-2">
													{project.description}
												</p>
												<div className="flex flex-wrap gap-1">
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
											</div>
											<Button variant="ghost" size="sm">
												<Edit className="w-4 h-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
