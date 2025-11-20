"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Briefcase } from "lucide-react";
import { getStudents } from "@/lib/api";

interface Student {
	id: string;
	name: string;
	email: string;
	skills: { name: string }[];
	projects: { id: string; title: string; highlight: boolean }[];
}

export default function TeacherDashboard() {
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

	const totalStudents = students.length;
	const totalProjects = students.reduce((sum, s) => sum + s.projects.length, 0);
	const highlightedProjects = students.reduce(
		(sum, s) => sum + s.projects.filter((p) => p.highlight).length,
		0
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="text-gray-600">Loading...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600 mb-1">
									Total Siswa
								</p>
								<p className="text-3xl font-bold text-blue-900">
									{totalStudents}
								</p>
							</div>
							<div className="bg-blue-600 rounded-lg p-3 bg-opacity-10">
								<Users className="w-8 h-8 text-blue-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600 mb-1">
									Project Approved
								</p>
								<p className="text-3xl font-bold text-green-900">
									{highlightedProjects}
								</p>
							</div>
							<div className="bg-green-600 rounded-lg p-3 bg-opacity-10">
								<CheckCircle className="w-8 h-8 text-green-600" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-600 mb-1">
									Total Projects
								</p>
								<p className="text-3xl font-bold text-purple-900">
									{totalProjects}
								</p>
							</div>
							<div className="bg-purple-600 rounded-lg p-3 bg-opacity-10">
								<Briefcase className="w-8 h-8 text-purple-600" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Activity Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-600 text-sm">
						Anda mengelola{" "}
						<span className="font-semibold">{totalStudents} siswa</span> dengan{" "}
						<span className="font-semibold">{totalProjects} projects</span>.
						Lihat menu "Siswa" untuk detail dan manage approvals.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
