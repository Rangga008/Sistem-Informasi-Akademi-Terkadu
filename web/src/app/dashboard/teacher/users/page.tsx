"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Search } from "lucide-react";
import { AdminResetPasswordModal } from "@/components/admin-reset-password-modal";
import { getStudents, resetPasswordAdmin } from "@/lib/api";

interface Student {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	skills: { name: string }[];
	projects: { id: string; title: string }[];
}

export default function UsersManagementPage() {
	const [students, setStudents] = useState<Student[]>([]);
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<{
		id: string;
		name: string;
		email: string;
	} | null>(null);

	useEffect(() => {
		fetchStudents();
	}, []);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredStudents(students);
		} else {
			const query = searchQuery.toLowerCase();
			setFilteredStudents(
				students.filter(
					(s) =>
						s.name.toLowerCase().includes(query) ||
						s.email.toLowerCase().includes(query)
				)
			);
		}
	}, [searchQuery, students]);

	const fetchStudents = async () => {
		try {
			const response = await getStudents();
			setStudents(response.data || []);
			setFilteredStudents(response.data || []);
		} catch (error) {
			console.error("Failed to fetch students:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (userId: string, newPassword: string) => {
		await resetPasswordAdmin(userId, newPassword);
		alert("Password berhasil direset");
	};

	const openResetPassword = (user: Student) => {
		setSelectedUser({ id: user.id, name: user.name, email: user.email });
		setResetPasswordOpen(true);
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
			<div>
				<h2 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h2>
				<p className="text-gray-600 mt-1">
					Kelola akun siswa dan reset password
				</p>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="p-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<Input
							placeholder="Cari siswa berdasarkan nama atau email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<CardTitle>Daftar Siswa ({filteredStudents.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{filteredStudents.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="border-b bg-gray-50">
									<tr>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Nama
										</th>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Email
										</th>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Skills
										</th>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Projects
										</th>
										<th className="text-right py-3 px-4 font-semibold text-gray-700">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredStudents.map((student) => (
										<tr key={student.id} className="border-b hover:bg-gray-50">
											<td className="py-3 px-4">
												<div className="flex items-center gap-3">
													{student.avatar ? (
														<img
															src={`http://localhost:3001${student.avatar}`}
															alt={student.name}
															className="w-10 h-10 rounded-full object-cover"
														/>
													) : (
														<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
															{student.name.charAt(0).toUpperCase()}
														</div>
													)}
													<p className="font-medium text-gray-900">
														{student.name}
													</p>
												</div>
											</td>
											<td className="py-3 px-4 text-gray-600">
												{student.email}
											</td>
											<td className="py-3 px-4">
												<p className="text-gray-600">
													{student.skills.length} skills
												</p>
											</td>
											<td className="py-3 px-4">
												<p className="text-gray-600">
													{student.projects.length} projects
												</p>
											</td>
											<td className="py-3 px-4 text-right">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openResetPassword(student)}
												>
													<Key className="w-4 h-4 mr-1" />
													Reset Password
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="text-center py-12 text-gray-500">
							{searchQuery
								? "Tidak ada siswa yang cocok dengan pencarian"
								: "Belum ada siswa terdaftar"}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Admin Reset Password Modal */}
			<AdminResetPasswordModal
				open={resetPasswordOpen}
				onClose={() => {
					setResetPasswordOpen(false);
					setSelectedUser(null);
				}}
				onSubmit={handleResetPassword}
				targetUser={selectedUser}
			/>
		</div>
	);
}
