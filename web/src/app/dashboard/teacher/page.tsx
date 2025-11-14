"use client";

import { useSession } from "next-auth/react";
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
import { api } from "@/lib/api";

interface Student {
	id: string;
	name: string;
	email: string;
	skills: { name: string }[];
	projects: { id: string; title: string; highlight: boolean }[];
}

export default function TeacherDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (status === "loading") return;

		if (!session || !session.user || session.user.role !== "guru") {
			router.push("/login");
			return;
		}

		fetchStudents();
	}, [session, status, router]);

	const fetchStudents = async () => {
		try {
			const response = await api.getStudents();
			setStudents(response.data);
		} catch (error) {
			console.error("Failed to fetch students:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleApproveProject = async (studentId: string, projectId: string) => {
		try {
			await api.approveProject(studentId, projectId);
			fetchStudents(); // Refresh data
		} catch (error) {
			console.error("Failed to approve project:", error);
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Dashboard Guru</h1>
					<p className="text-gray-600 mt-2">
						Kelola siswa dan approve project mereka
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{students.map((student) => (
						<Card
							key={student.id}
							className="hover:shadow-lg transition-shadow"
						>
							<CardHeader>
								<CardTitle className="text-xl">{student.name}</CardTitle>
								<CardDescription>{student.email}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold text-sm text-gray-700 mb-2">
											Skills:
										</h4>
										<div className="flex flex-wrap gap-1">
											{student.skills.map((skill, index) => (
												<span
													key={index}
													className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
												>
													{skill.name}
												</span>
											))}
										</div>
									</div>

									<div>
										<h4 className="font-semibold text-sm text-gray-700 mb-2">
											Projects:
										</h4>
										<div className="space-y-2">
											{student.projects.map((project, index) => (
												<div
													key={index}
													className="flex items-center justify-between"
												>
													<span className="text-sm">{project.title}</span>
													{project.highlight ? (
														<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
															Highlighted
														</span>
													) : (
														<Button
															size="sm"
															onClick={() =>
																handleApproveProject(student.id, project.id)
															}
															className="text-xs"
														>
															Approve
														</Button>
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{students.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500">Belum ada siswa terdaftar</p>
					</div>
				)}
			</div>
		</div>
	);
}
