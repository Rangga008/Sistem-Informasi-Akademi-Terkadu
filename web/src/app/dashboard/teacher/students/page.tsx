"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User, Search, X } from "lucide-react";
import Link from "next/link";
import {
	api,
	getStudents,
	createStudent,
	updateUser,
	deleteUser,
} from "@/lib/api";

interface Student {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	bio?: string;
	skills: { name: string }[];
	abilities?: string[];
	projects: {
		id: string;
		title: string;
		description?: string;
		highlight: boolean;
	}[];
}

export default function StudentsPage() {
	const [students, setStudents] = useState<Student[]>([]);
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editingStudent, setEditingStudent] = useState<Student | null>(null);
	const [formName, setFormName] = useState("");
	const [formEmail, setFormEmail] = useState("");
	const [formBio, setFormBio] = useState("");
	const [formSkills, setFormSkills] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState("");
	const [formAbilities, setFormAbilities] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<{
		open: boolean;
		studentId: string | null;
	}>({
		open: false,
		studentId: null,
	});

	useEffect(() => {
		fetchStudents();
	}, []);

	useEffect(() => {
		const runSearch = async () => {
			if (search && search.trim().length > 0) {
				try {
					const res = await api.get(
						`/users/search?q=${encodeURIComponent(search)}`
					);
					setFilteredStudents(res.data || []);
				} catch (err) {
					console.error("Search failed", err);
					setFilteredStudents([]);
				}
			} else {
				const filtered = students.filter(
					(s) =>
						s.name.toLowerCase().includes(search.toLowerCase()) ||
						s.email.toLowerCase().includes(search.toLowerCase())
				);
				setFilteredStudents(filtered);
			}
		};

		runSearch();
	}, [search, students]);

	// Pagination state
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
	const paginatedStudents = filteredStudents.slice(
		(page - 1) * pageSize,
		page * pageSize
	);

	const fetchStudents = async () => {
		try {
			const response = await getStudents();
			setStudents(response.data || []);
		} catch (error) {
			console.error("Failed to fetch students:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenAdd = () => {
		setFormName("");
		setFormEmail("");
		setIsAddOpen(true);
	};

	const handleCreateStudent = async () => {
		// basic client-side validation
		const emailRegex = /^\S+@\S+\.\S+$/;
		if (!formName.trim()) {
			alert("Nama wajib diisi");
			return;
		}
		if (!emailRegex.test(formEmail)) {
			alert("Email tidak valid");
			return;
		}
		try {
			await createStudent({
				name: formName,
				email: formEmail,
				role: "STUDENT",
			});
			setIsAddOpen(false);
			fetchStudents();
		} catch (err) {
			console.error("Failed to create student", err);
		}
	};

	const handleOpenEdit = (s: Student) => {
		setEditingStudent(s);
		setFormName(s.name);
		setFormEmail(s.email);
		setFormBio(s.bio || "");
		setFormSkills(s.skills.map((sk) => sk.name) || []);
		setSkillInput("");
		setFormAbilities((s.abilities || []).join(", ") || "");
		setIsEditOpen(true);
	};

	const handleUpdateStudent = async () => {
		if (!editingStudent) return;
		const emailRegex = /^\S+@\S+\.\S+$/;
		if (!formName.trim()) {
			alert("Nama wajib diisi");
			return;
		}
		if (!emailRegex.test(formEmail)) {
			alert("Email tidak valid");
			return;
		}
		try {
			console.log("Sending update request:", {
				name: formName,
				email: formEmail,
				bio: formBio,
				skills: formSkills,
				abilities: formAbilities,
			});

			await updateUser(editingStudent.id, {
				name: formName,
				email: formEmail,
				bio: formBio,
				skills: formSkills,
				abilities: formAbilities,
			});
			setIsEditOpen(false);
			setEditingStudent(null);
			fetchStudents();
		} catch (err) {
			console.error("Failed to update student", err);
			alert("Gagal mengupdate siswa. Lihat console untuk detail.");
		}
	};

	const handleDeleteStudent = async () => {
		const studentId = deleteConfirm.studentId;
		if (!studentId) return;

		try {
			await deleteUser(studentId);
			setDeleteConfirm({ open: false, studentId: null });
			fetchStudents();
		} catch (err) {
			console.error("Failed to delete student", err);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="text-gray-600">Loading...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">Manajemen Siswa</h2>
					<p className="text-gray-600 mt-1">Total siswa: {students.length}</p>
				</div>
				<div>
					<Button onClick={handleOpenAdd}>Tambah Siswa</Button>
				</div>
			</div>
			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
				<Input
					placeholder="Cari siswa berdasarkan nama atau email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-10"
				/>
			</div>
			{/* Add / Edit Modals */}
			{isAddOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => setIsAddOpen(false)}
					/>
					<div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
						<h3 className="text-lg font-semibold mb-4">Tambah Siswa</h3>
						<div className="space-y-3">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Nama
								</label>
								<Input
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Email
								</label>
								<Input
									value={formEmail}
									onChange={(e) => setFormEmail(e.target.value)}
								/>
							</div>
							<div className="flex justify-end gap-2 pt-2">
								<Button variant="ghost" onClick={() => setIsAddOpen(false)}>
									Batal
								</Button>
								<Button onClick={handleCreateStudent}>Simpan</Button>
							</div>
						</div>
					</div>
				</div>
			)}
			{isEditOpen && editingStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => setIsEditOpen(false)}
					/>
					<div className="bg-white rounded-lg p-6 z-10 w-full max-w-md max-h-[90vh] overflow-y-auto">
						<h3 className="text-lg font-semibold mb-4">Edit Siswa</h3>
						<div className="space-y-3">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Nama
								</label>
								<Input
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Email
								</label>
								<Input
									value={formEmail}
									onChange={(e) => setFormEmail(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Bio
								</label>
								<textarea
									value={formBio}
									onChange={(e) => setFormBio(e.target.value)}
									placeholder="Biodata singkat siswa"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
									rows={3}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Skill/Keahlian
								</label>
								<div className="space-y-2">
									<div className="flex gap-2">
										<Input
											value={skillInput}
											onChange={(e) => setSkillInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" && skillInput.trim()) {
													e.preventDefault();
													if (!formSkills.includes(skillInput.trim())) {
														setFormSkills([...formSkills, skillInput.trim()]);
														setSkillInput("");
													}
												}
											}}
											placeholder="Tambah skill (tekan Enter)"
											className="flex-1"
										/>
										<Button
											type="button"
											onClick={() => {
												if (
													skillInput.trim() &&
													!formSkills.includes(skillInput.trim())
												) {
													setFormSkills([...formSkills, skillInput.trim()]);
													setSkillInput("");
												}
											}}
											variant="outline"
											size="sm"
										>
											Tambah
										</Button>
									</div>
									{formSkills.length > 0 && (
										<div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border border-gray-200">
											{formSkills.map((skill) => (
												<Badge
													key={skill}
													variant="secondary"
													className="flex items-center gap-1"
												>
													{skill}
													<button
														onClick={() =>
															setFormSkills(
																formSkills.filter((s) => s !== skill)
															)
														}
														className="ml-1 hover:text-red-600"
													>
														×
													</button>
												</Badge>
											))}
										</div>
									)}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Kemampuan
								</label>
								<Input
									value={formAbilities}
									onChange={(e) => setFormAbilities(e.target.value)}
									placeholder="Pisahkan dengan koma (contoh: Leadership, Communication)"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Pisahkan dengan koma untuk multiple values
								</p>
							</div>
							<div className="flex justify-end gap-2 pt-4 border-t">
								<Button variant="ghost" onClick={() => setIsEditOpen(false)}>
									Batal
								</Button>
								<Button onClick={handleUpdateStudent}>Simpan</Button>
							</div>
						</div>
					</div>
				</div>
			)}{" "}
			{/* Students List */}
			<div className="space-y-4">
				{paginatedStudents.length > 0 ? (
					paginatedStudents.map((student) => (
						<Card
							key={student.id}
							className="hover:shadow-lg transition-shadow"
						>
							<CardContent className="p-6">
								<div className="flex items-start justify-between gap-6">
									{/* Student Info */}
									<div className="flex items-start gap-4 flex-1">
										<Avatar className="w-12 h-12">
											<AvatarImage
												src={
													student.avatar
														? `http://localhost:3001${student.avatar}`
														: undefined
												}
												alt={student.name}
											/>
											<AvatarFallback className="bg-blue-100">
												<User className="w-6 h-6 text-blue-600" />
											</AvatarFallback>
										</Avatar>

										<div className="flex-1">
											<h3 className="font-semibold text-lg text-gray-900">
												{student.name}
											</h3>
											<p className="text-sm text-gray-600">{student.email}</p>

											{/* Skills */}
											{student.skills.length > 0 && (
												<div className="mt-3 space-y-2">
													<p className="text-xs font-semibold text-gray-700 uppercase">
														Skills
													</p>
													<div className="flex flex-wrap gap-2">
														{student.skills.map((skill) => (
															<Badge
																key={skill.name}
																variant="secondary"
																className="text-xs"
															>
																{skill.name}
															</Badge>
														))}
													</div>
												</div>
											)}

											{/* Projects Count */}
											{student.projects.length > 0 && (
												<div className="mt-4">
													<p className="text-xs font-semibold text-gray-700 uppercase">
														Projects ({student.projects.length})
													</p>
												</div>
											)}
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-col gap-2">
										<div className="flex gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleOpenEdit(student)}
											>
												Edit
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() =>
													setDeleteConfirm({
														open: true,
														studentId: student.id,
													})
												}
											>
												Hapus
											</Button>
										</div>
										<div className="flex gap-2">
											<Link href={`/profile/${student.id}`}>
												<Button variant="outline" size="sm">
													Lihat Profil
												</Button>
											</Link>
											{student.projects.length > 0 && (
												<Link
													href={`/dashboard/teacher/students/${student.id}/projects`}
												>
													<Button variant="outline" size="sm">
														Lihat Project
													</Button>
												</Link>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				) : (
					<Card>
						<CardContent className="p-12 text-center">
							<p className="text-gray-500">
								{search
									? "Tidak ada siswa yang cocok dengan pencarian"
									: "Belum ada siswa"}
							</p>
						</CardContent>
					</Card>
				)}
			</div>
			{/* Pagination Controls */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-gray-600">
					Menampilkan{" "}
					{filteredStudents.length === 0
						? 0
						: Math.min((page - 1) * pageSize + 1, filteredStudents.length)}{" "}
					- {Math.min(page * pageSize, filteredStudents.length)} dari{" "}
					{filteredStudents.length}
				</div>
				<div className="flex items-center gap-2">
					<select
						value={pageSize}
						onChange={(e) => {
							setPageSize(parseInt(e.target.value, 10));
							setPage(1);
						}}
						className="border rounded px-2 py-1 text-sm"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
					</select>
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						Prev
					</Button>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					>
						Next
					</Button>
				</div>
			</div>
			{/* Delete Confirmation Modal */}
			{deleteConfirm.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 w-full max-w-sm">
						<h3 className="text-lg font-semibold mb-4 text-gray-900">
							Hapus Siswa
						</h3>
						<p className="text-gray-600 mb-6">
							Apakah Anda yakin ingin menghapus siswa ini? Tindakan ini tidak
							dapat dibatalkan.
						</p>
						<div className="flex justify-end gap-2">
							<Button
								variant="ghost"
								onClick={() =>
									setDeleteConfirm({ open: false, studentId: null })
								}
							>
								Batal
							</Button>
							<Button variant="destructive" onClick={handleDeleteStudent}>
								Hapus
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
