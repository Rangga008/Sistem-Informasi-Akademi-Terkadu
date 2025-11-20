"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Users,
	LogOut,
	Menu,
	X,
	GraduationCap,
	CheckCircle,
	Home,
} from "lucide-react";
import { getCurrentUser } from "@/lib/api";

interface TeacherUser {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function TeacherLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState<TeacherUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (!isClient) return;
		checkAuth();
	}, [isClient]);

	const checkAuth = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				// eslint-disable-next-line no-console
				console.debug("[teacher-layout] No token, redirecting to login");
				router.push("/login");
				setLoading(false);
				return;
			}

			try {
				const userData = await getCurrentUser();
				if (!userData || userData.role !== "TEACHER") {
					// eslint-disable-next-line no-console
					console.debug(
						"[teacher-layout] User not TEACHER, redirecting:",
						userData?.role
					);
					router.push("/login");
					setLoading(false);
					return;
				}
				setUser(userData);
			} catch (authError: any) {
				// eslint-disable-next-line no-console
				console.debug(
					"[teacher-layout] Auth failed:",
					authError.response?.status
				);
				router.push("/login");
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("[teacher-layout] checkAuth error:", error);
			router.push("/login");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUser(null);
		router.push("/");
	};

	if (!isClient || loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-50">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null; // Will redirect via useEffect
	}

	const menuItems = [
		{ href: "/dashboard/teacher", label: "Dashboard", icon: Home },
		{ href: "/dashboard/teacher/students", label: "Siswa", icon: Users },
		{
			href: "/dashboard/teacher/approvals",
			label: "Approvals",
			icon: CheckCircle,
		},
	];

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<div
				className={`${
					sidebarOpen ? "w-64" : "w-20"
				} bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 flex flex-col`}
			>
				{/* Logo */}
				<div className="p-6 border-b border-blue-500">
					<div className="flex items-center gap-3">
						<div className="bg-white rounded-lg p-2">
							<GraduationCap className="w-6 h-6 text-blue-600" />
						</div>
						{sidebarOpen && (
							<div>
								<h1 className="font-bold text-lg">SisTerKadu</h1>
								<p className="text-xs text-blue-200">Guru</p>
							</div>
						)}
					</div>
				</div>
				{/* Navigation */}
				<nav className="flex-1 px-3 py-6 space-y-2">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
									isActive
										? "bg-white/20 text-white shadow-lg"
										: "text-blue-100 hover:bg-white/10"
								}`}
								title={item.label}
							>
								<Icon className="w-5 h-5 flex-shrink-0" />
								{sidebarOpen && (
									<span className="text-sm font-medium">{item.label}</span>
								)}
							</Link>
						);
					})}
				</nav>{" "}
				{/* User Profile & Logout */}
				<div className="border-t border-blue-500 p-3 space-y-2">
					{sidebarOpen && (
						<div className="px-4 py-2 bg-white/10 rounded-lg">
							<p className="text-xs text-blue-200">Login sebagai</p>
							<p className="font-semibold text-sm truncate">{user.name}</p>
							<p className="text-xs text-blue-200 truncate">{user.email}</p>
						</div>
					)}
					<Button
						onClick={handleLogout}
						variant="ghost"
						className="w-full justify-start text-red-200 hover:text-red-100 hover:bg-red-500/20"
					>
						<LogOut className="w-4 h-4 mr-2" />
						{sidebarOpen && <span>Logout</span>}
					</Button>
				</div>
				{/* Toggle Sidebar */}
				<div className="p-3 border-t border-blue-500">
					<Button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						variant="ghost"
						size="sm"
						className="w-full text-blue-100 hover:bg-white/10"
					>
						{sidebarOpen ? (
							<X className="w-5 h-5" />
						) : (
							<Menu className="w-5 h-5" />
						)}
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top Bar */}
				<div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
					<div className="flex items-center gap-4">
						<p className="text-sm text-gray-600">
							Selamat datang, <span className="font-semibold">{user.name}</span>
						</p>
					</div>
				</div>

				{/* Content Area */}
				<div className="flex-1 overflow-auto p-6">
					<div className="max-w-7xl mx-auto">{children}</div>
				</div>
			</div>
		</div>
	);
}
