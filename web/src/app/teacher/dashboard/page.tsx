"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, User, Users, CheckCircle, XCircle } from "lucide-react";

interface Student {
	id: string;
	name: string;
	email: string;
	role: "STUDENT";
	bio?: string;
	avatar?: string;
	skills: { name: string }[];
	projects: { title: string; highlight: boolean }[];
	isApproved: boolean;
}

export default function TeacherDashboard() {
	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);
	const [newStudentEmail, setNewStudentEmail] = useState("");
	const [newStudentName, setNewStudentName] = useState("");
	const [isAddingStudent, setIsAddingStudent] = useState(false);

	useEffect(() => {
		fetchStudents();
	}, []);

	const fetchStudents = async () => {
		try {
			// TODO: Replace with actual API call
			const response = await fetch("/api/teacher/students");
			const data = await response.json();
			setStudents(data);
		} catch (error) {
			console.error("Failed to fetch students:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddStudent = async () => {
		if (!newStudentEmail.trim() || !newStudentName.trim()) return;

		setIsAddingStudent(true);
		try {
			// TODO: Replace with actual API call
			const response = await fetch("/api/teacher/students", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: newStudentEmail,
					name: newStudentName,
					role: "STUDENT",
				}),
			});

			if (response.ok) {
				setNewStudentEmail("");
				setNewStudentName("");
				fetchStudents(); // Refresh list
			}
		} catch (error) {
			console.error("Failed to add student:", error);
		} finally {
			setIsAddingStudent(false);
		}
	};

	const handleApproveStudent = async (studentId: string) => {
		try {
			// TODO: Replace with actual API call
			await fetch(`/api/teacher/students/${studentId}/approve`, {
				method: "POST",
			});
			fetchStudents(); // Refresh list
		} catch (error) {
			console.error("Failed to approve student:", error);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Dashboard Guru</h1>
						<p className="text-gray-600 mt-2">
							Kelola akun siswa dan approve project
						</p>
					</div>

					<Dialog>
						<DialogTrigger asChild>
							<Button>
								<Plus className="w-4 h-4 mr-2" />
								Tambah Siswa
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Tambah Siswa Baru</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Nama Lengkap
									</label>
									<Input
										type="text"
										value={newStudentName}
										onChange={(e) => setNewStudentName(e.target.value)}
										placeholder="Masukkan nama siswa"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Email
									</label>
									<Input
										type="email"
										value={newStudentEmail}
										onChange={(e) => setNewStudentEmail(e.target.value)}
										placeholder="Masukkan email siswa"
									/>
								</div>
								<Button
									onClick={handleAddStudent}
									disabled={isAddingStudent}
									className="w-full"
								>
									{isAddingStudent ? "Menambah..." : "Tambah Siswa"}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<Users className="w-8 h-8 text-blue-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Total Siswa
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{students.length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<CheckCircle className="w-8 h-8 text-green-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Sudah Approve
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{students.filter((s) => s.isApproved).length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center">
								<XCircle className="w-8 h-8 text-yellow-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Menunggu Approve
									</p>
									<p className="text-2xl font-bold text-gray-900">
										{students.filter((s) => !s.isApproved).length}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Students List */}
				<Card>
					<CardHeader>
						<CardTitle>Daftar Siswa</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{students.map((student) => (
								<div
									key={student.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div className="flex items-center space-x-4">
										<Avatar>
											<AvatarImage src={student.avatar} alt={student.name} />
											<AvatarFallback>
												<User className="w-5 h-5" />
											</AvatarFallback>
										</Avatar>

										<div>
											<h3 className="font-medium text-gray-900">
												{student.name}
											</h3>
											<p className="text-sm text-gray-600">{student.email}</p>
											<div className="flex items-center gap-2 mt-1">
												<Badge
													variant={student.isApproved ? "default" : "secondary"}
												>
													{student.isApproved ? "Approved" : "Pending"}
												</Badge>
												<span className="text-xs text-gray-500">
													{student.skills.length} skills •{" "}
													{student.projects.length} projects
												</span>
											</div>
										</div>
									</div>

									<div className="flex gap-2">
										<Button variant="outline" size="sm" asChild>
											<a href={`/profile/${student.id}`}>Lihat Profil</a>
										</Button>

										{!student.isApproved && (
											<Button
												size="sm"
												onClick={() => handleApproveStudent(student.id)}
											>
												Approve
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
