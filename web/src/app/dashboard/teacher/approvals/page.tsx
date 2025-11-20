"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, AlertCircle } from "lucide-react";
import { api, getStudents, updateProject, deleteProject } from "@/lib/api";

interface Project {
	id: string;
	title: string;
	highlight: boolean;
}

interface Student {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	projects: Project[];
}

export default function ApprovalsPage() {
	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStudents();
	}, []);

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

	const handleApproveProject = async (projectId: string) => {
		try {
			await api.patch(`/projects/${projectId}`, {
				highlight: true,
			});
			fetchStudents();
		} catch (error) {
			console.error("Failed to approve project:", error);
		}
	};

	const openEditProject = async (project: Project) => {
		const newTitle = window.prompt("Ubah judul project:", project.title);
		if (newTitle === null) return; // cancelled
		const newHighlight = window.confirm("Tandai sebagai highlight?");
		try {
			await updateProject(project.id, {
				title: newTitle,
				highlight: newHighlight,
			});
			fetchStudents();
		} catch (err) {
			console.error("Failed to update project", err);
		}
	};

	const handleDeleteProject = async (projectId: string) => {
		if (!confirm("Hapus project ini?")) return;
		try {
			await deleteProject(projectId);
			fetchStudents();
		} catch (err) {
			console.error("Failed to delete project", err);
		}
	};

	// Filter projects that need approval
	const pendingApprovals = students
		.map((student) => ({
			student,
			projects: student.projects.filter((p) => !p.highlight),
		}))
		.filter((item) => item.projects.length > 0);

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
					<h2 className="text-2xl font-bold text-gray-900">
						Project Approvals
					</h2>
					<p className="text-gray-600 mt-1">
						Pending approvals:{" "}
						{pendingApprovals.reduce(
							(sum, item) => sum + item.projects.length,
							0
						)}
					</p>
				</div>
			</div>

			{/* Pending Approvals */}
			{pendingApprovals.length > 0 ? (
				<div className="space-y-4">
					{pendingApprovals.map(({ student, projects }) => (
						<Card key={student.id} className="border-amber-200 bg-amber-50">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-3">
									<Avatar className="w-10 h-10">
										<AvatarImage
											src={
												student.avatar
													? `http://localhost:3001${student.avatar}`
													: undefined
											}
											alt={student.name}
										/>
										<AvatarFallback className="bg-blue-100">
											<User className="w-5 h-5 text-blue-600" />
										</AvatarFallback>
									</Avatar>
									<div>
										<CardTitle className="text-lg">{student.name}</CardTitle>
										<p className="text-sm text-gray-600">{student.email}</p>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{projects.map((project) => (
									<div
										key={project.id}
										className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-100"
									>
										<div className="flex items-center gap-3 flex-1">
											<AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
											<div>
												<p className="font-medium text-gray-900">
													{project.title}
												</p>
												<p className="text-xs text-gray-600">
													Pending approval
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												onClick={() => handleApproveProject(project.id)}
												className="bg-green-600 hover:bg-green-700"
											>
												Approve
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openEditProject(project)}
											>
												Edit
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDeleteProject(project.id)}
											>
												Hapus
											</Button>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card className="border-green-200 bg-green-50">
					<CardContent className="p-12 text-center">
						<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
							<User className="w-6 h-6 text-green-600" />
						</div>

						<h3 className="font-semibold text-gray-900 mb-1">Semua Clear!</h3>
						<p className="text-gray-600">
							Tidak ada project yang menunggu approval
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
