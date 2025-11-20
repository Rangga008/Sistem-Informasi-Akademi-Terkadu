"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Search,
	Filter,
	Star,
	Eye,
	User,
	Briefcase,
	Heart,
	Share2,
	ExternalLink,
	ChevronDown,
	X,
} from "lucide-react";
import { api } from "@/lib/api";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import FollowButton from "@/components/follow-button";
import LikeButton from "@/components/like-button";

interface User {
	id: string;
	name: string;
	email: string;
	bio?: string;
	avatar?: string;
	role: string;
}

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
	userId: string;
	user: User;
}

interface SearchResult {
	users: User[];
	projects: Project[];
}

export default function SearchPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult>({
		users: [],
		projects: [],
	});
	const [topStudents, setTopStudents] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [filter, setFilter] = useState<"all" | "users" | "projects">("all");
	const [showFilters, setShowFilters] = useState(false);
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

	useEffect(() => {
		// Load initial data or popular content
		loadInitialContent();
	}, []);

	const loadInitialContent = async () => {
		try {
			setLoading(true);
			// Fetch top students, all students and all projects for public access
			const [topStudentsRes, usersRes, projectsRes] = await Promise.all([
				api.get("/users/top-students?limit=10").catch(() => ({ data: [] })), // Top students by project count
				api.get("/users/search?q=").catch(() => ({ data: [] })), // Public endpoint for all students
				api.get("/projects?highlight=true").catch(() => ({ data: [] })), // Public endpoint for highlight projects only
			]);
			setTopStudents(topStudentsRes.data || []);
			setSearchResults({
				users: usersRes.data || [],
				projects: projectsRes.data || [],
			});
		} catch (error) {
			console.error("Failed to load initial content:", error);
			// For demo purposes, show empty state
			setTopStudents([]);
			setSearchResults({ users: [], projects: [] });
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			loadInitialContent();
			return;
		}

		try {
			setLoading(true);
			// Use backend search API for comprehensive search
			const [usersRes, projectsRes] = await Promise.all([
				api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`),
				api.get(`/projects/search?q=${encodeURIComponent(searchQuery)}`),
			]);

			setSearchResults({
				users: usersRes.data || [],
				projects: projectsRes.data || [],
			});
		} catch (error) {
			console.error("Search failed:", error);
			// Fallback to local filtering if API fails
			const filteredUsers = searchResults.users.filter(
				(user) =>
					user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
			);
			const filteredProjects = searchResults.projects.filter(
				(project) =>
					project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					project.description
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					project.keywords.some((keyword) =>
						keyword.toLowerCase().includes(searchQuery.toLowerCase())
					)
			);

			setSearchResults({
				users: filteredUsers,
				projects: filteredProjects,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const toggleSkillFilter = (skill: string) => {
		setSelectedSkills((prev) =>
			prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
		);
	};

	const clearFilters = () => {
		setSelectedSkills([]);
		setFilter("all");
	};

	// Separate filtered lists for users and projects so we can render them in
	// their own responsive grids and avoid mixed-card height misalignment.
	const filteredUsers = () => {
		if (filter === "projects") return [] as User[];
		// Return users as provided by the API. Additional local filtering
		// (by searchQuery) is handled server-side or in handleSearch fallback.
		return searchResults.users || [];
	};

	const filteredProjects = () => {
		if (filter === "users") return [] as Project[];

		let projects = searchResults.projects || [];

		// Apply skill filters for projects
		if (selectedSkills.length > 0) {
			projects = projects.filter((project) =>
				(project.keywords || []).some((k) =>
					selectedSkills.some((skill) =>
						k.toLowerCase().includes(skill.toLowerCase())
					)
				)
			);
		}

		return projects;
	};

	const renderTopStudentCard = (user: User) => (
		<Card
			key={user.id}
			className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-white shrink-0 w-64"
		>
			<CardContent className="p-4">
				<div className="flex items-center space-x-3">
					<Avatar className="w-12 h-12 border-2 border-blue-100">
						<AvatarImage
							src={
								user.avatar ? `http://localhost:3001${user.avatar}` : undefined
							}
							alt={user.name}
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).src =
									"/placeholder-image.svg";
							}}
						/>
						<AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-sm">
							{user.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
							{user.name}
						</h4>
						<Badge
							variant="secondary"
							className="bg-blue-100 text-blue-700 text-xs mt-1"
						>
							<User className="w-2 h-2 mr-1" />
							Siswa
						</Badge>
					</div>

					<Link href={`/profile/${user.id}`}>
						<Button
							size="sm"
							variant="outline"
							className="hover:bg-blue-50 text-xs px-2 py-1"
						>
							Lihat
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);

	const renderUserCard = (user: User) => (
		<Card
			key={user.id}
			className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg bg-white h-full flex flex-col"
		>
			<CardContent className="p-6 flex flex-col flex-1">
				<div className="flex items-start space-x-4">
					<Avatar className="w-16 h-16 border-2 border-blue-100 shrink-0">
						<AvatarImage
							src={
								user.avatar ? `http://localhost:3001${user.avatar}` : undefined
							}
							alt={user.name}
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).src =
									"/placeholder-image.svg";
							}}
						/>
						<AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-lg">
							{user.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
								{user.name}
							</h3>
							<Badge variant="secondary" className="bg-blue-100 text-blue-700">
								<User className="w-3 h-3 mr-1" />
								Siswa
							</Badge>
						</div>

						{user.bio && (
							<p className="text-gray-600 text-sm mb-3 line-clamp-2">
								{user.bio}
							</p>
						)}
					</div>
				</div>

				{/* Actions pinned to bottom for consistent card heights */}
				<div className="mt-auto flex items-center justify-between pt-4 border-t border-transparent">
					<div className="flex items-center space-x-4 text-sm text-gray-500">
						<span className="flex items-center">
							<Eye className="w-4 h-4 mr-1" />
							Profile
						</span>
					</div>

					<div className="flex items-center gap-2">
						<FollowButton targetUserId={user.id} />
						<Link href={`/profile/${user.id}`}>
							<Button
								size="sm"
								className="bg-blue-600 hover:bg-blue-700 h-9 px-3 flex items-center text-white"
							>
								<ExternalLink className="w-4 h-4 mr-2" />
								<span className="text-sm">Lihat</span>
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const renderProjectCard = (project: Project) => (
		<Card
			key={project.id}
			className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg bg-white overflow-hidden h-full flex flex-col"
		>
			{/* Project Image */}
			{project.images && project.images.length > 0 ? (
				<div className="relative h-48 bg-gray-200 overflow-hidden shrink-0">
					<ImageWithFallback
						src={`http://localhost:3001${project.images[0]}`}
						alt={project.title}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
					{project.highlight && (
						<div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
							<Star className="w-3 h-3 mr-1 fill-current" />
							Highlight
						</div>
					)}
				</div>
			) : (
				<div className="h-48 bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
					<Briefcase className="w-12 h-12 text-blue-400" />
				</div>
			)}

			<CardContent className="p-6">
				<div className="flex items-start justify-between mb-3">
					<div className="flex-1 min-w-0">
						<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
							{project.title}
						</h3>
						<Link
							href={`/profile/${project.user?.id || project.userId}`}
							className="text-sm text-gray-600 hover:text-blue-600 mb-2 block"
						>
							oleh {project.user?.name || "Unknown User"}
						</Link>
					</div>
					{project.highlight && (
						<Star className="w-5 h-5 text-yellow-500 fill-current" />
					)}
				</div>

				<p className="text-gray-600 text-sm mb-4 line-clamp-3">
					{project.description}
				</p>

				{/* Keywords */}
				<div className="flex flex-wrap gap-2 mb-4">
					{(project.keywords || []).slice(0, 3).map((keyword, index) => (
						<Badge key={index} variant="outline" className="text-xs">
							{keyword}
						</Badge>
					))}
					{(project.keywords || []).length > 3 && (
						<Badge variant="outline" className="text-xs">
							+{(project.keywords || []).length - 3} lagi
						</Badge>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4 text-sm text-gray-500">
						<Link
							href={`/project/${project.id}`}
							className="flex items-center hover:text-blue-600"
						>
							<Eye className="w-4 h-4 mr-1" />
							Lihat Detail
						</Link>
					</div>

					<div className="flex items-center space-x-2">
						<LikeButton projectId={project.id} />
						<Button
							variant="outline"
							size="sm"
							className="hover:bg-blue-50 hover:border-blue-200"
						>
							<Share2 className="w-4 h-4 mr-1" />
							Bagikan
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Search Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Cari Talenta Siswa
						</h1>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Temukan siswa berbakat berdasarkan skill, nama, atau project yang
							mereka buat
						</p>
					</div>

					{/* Search Bar */}
					<div className="max-w-2xl mx-auto mb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<Input
								type="text"
								placeholder="Cari siswa, skill, atau project..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyPress={handleKeyPress}
								className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-full"
							/>
							<Button
								onClick={handleSearch}
								className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full px-6"
								disabled={loading}
							>
								{loading ? "Mencari..." : "Cari"}
							</Button>
						</div>
					</div>

					{/* Filters */}
					<div className="flex flex-wrap items-center justify-center gap-4">
						<div className="flex bg-gray-100 rounded-lg p-1">
							<Button
								variant={filter === "all" ? "default" : "ghost"}
								size="sm"
								onClick={() => setFilter("all")}
								className="rounded-md"
							>
								Semua
							</Button>
							<Button
								variant={filter === "users" ? "default" : "ghost"}
								size="sm"
								onClick={() => setFilter("users")}
								className="rounded-md"
							>
								Siswa
							</Button>
							<Button
								variant={filter === "projects" ? "default" : "ghost"}
								size="sm"
								onClick={() => setFilter("projects")}
								className="rounded-md"
							>
								Project
							</Button>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center"
						>
							<Filter className="w-4 h-4 mr-2" />
							Filter
							<ChevronDown
								className={`w-4 h-4 ml-2 transition-transform ${
									showFilters ? "rotate-180" : ""
								}`}
							/>
						</Button>

						{(selectedSkills.length > 0 || filter !== "all") && (
							<Button variant="outline" size="sm" onClick={clearFilters}>
								<X className="w-4 h-4 mr-2" />
								Clear Filters
							</Button>
						)}
					</div>

					{/* Advanced Filters */}
					{showFilters && (
						<div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto">
							<h3 className="text-sm font-medium text-gray-900 mb-3">
								Filter berdasarkan Skill:
							</h3>
							<div className="flex flex-wrap gap-2">
								{[
									"React",
									"Node.js",
									"Python",
									"JavaScript",
									"TypeScript",
									"UI/UX",
									"Mobile",
									"Web",
								].map((skill) => (
									<Badge
										key={skill}
										variant={
											selectedSkills.includes(skill) ? "default" : "outline"
										}
										className="cursor-pointer hover:bg-blue-100"
										onClick={() => toggleSkillFilter(skill)}
									>
										{skill}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Results Grid */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{loading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : (
					<>
						{/* Top Students Carousel - Only show when no search query */}
						{!searchQuery && topStudents.length > 0 && (
							<div className="mb-8">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold text-gray-900">
										Siswa Terbaik
									</h2>
									<p className="text-sm text-gray-600">
										Berdasarkan jumlah project yang dibuat
									</p>
								</div>
								<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
									{topStudents.map((student) => renderTopStudentCard(student))}
								</div>
							</div>
						)}

						{/* Results Count */}
						<div className="mb-6">
							<p className="text-gray-600">
								Ditemukan {filteredUsers().length + filteredProjects().length}{" "}
								hasil
								{searchQuery && ` untuk "${searchQuery}"`}
							</p>
						</div>

						{/* Results Sections - separate Users and Projects */}
						{(() => {
							const users = filteredUsers();
							const projects = filteredProjects();
							const total = users.length + projects.length;

							return (
								<>
									{/* Profiles Section */}
									{users.length > 0 && (
										<div className="mb-8">
											<div className="flex items-center justify-between mb-4">
												<h2 className="text-xl font-semibold text-gray-900">
													Siswa / Profiles
												</h2>
												<p className="text-sm text-gray-600">
													{users.length} ditemukan
												</p>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
												{users.map((u) => renderUserCard(u))}
											</div>
										</div>
									)}

									{/* Projects Section */}
									{projects.length > 0 && (
										<div className="mb-8">
											<div className="flex items-center justify-between mb-4">
												<h2 className="text-xl font-semibold text-gray-900">
													Project
												</h2>
												<p className="text-sm text-gray-600">
													{projects.length} ditemukan
												</p>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{projects.map((p) => renderProjectCard(p))}
											</div>
										</div>
									)}

									{/* If nothing, show empty state handled below */}
								</>
							);
						})()}

						{/* Empty State */}
						{filteredUsers().length + filteredProjects().length === 0 &&
							!loading && (
								<div className="text-center py-20">
									<Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										Tidak ada hasil ditemukan
									</h3>
									<p className="text-gray-600 mb-4">
										Coba ubah kata kunci pencarian atau filter yang berbeda
									</p>
									<Button
										onClick={() => {
											setSearchQuery("");
											setSelectedSkills([]);
											setFilter("all");
											loadInitialContent();
										}}
									>
										Reset Pencarian
									</Button>
								</div>
							)}
					</>
				)}
			</div>
		</div>
	);
}
