"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	User,
	LogOut,
	Search,
	Home,
	Briefcase,
	Users,
	Menu,
	X,
	GraduationCap,
	ChevronDown,
	Edit,
} from "lucide-react";
import { getCurrentUser } from "@/lib/api";

interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	avatar?: string;
}

export default function Navbar() {
	const [user, setUser] = useState<User | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [tokenDebug, setTokenDebug] = useState<string>("");
	const router = useRouter();
	const pathname = usePathname();

	const checkAuth = async () => {
		try {
			const token = localStorage.getItem("token");
			const tokenPreview = token ? `${token.slice(0, 15)}...` : "NO_TOKEN";
			setTokenDebug(tokenPreview);
			if (token) {
				try {
					const userData = await getCurrentUser();
					setUser(userData);
				} catch (authError: any) {
					// 401 is expected if token is invalid or expired; don't crash navbar
					if (authError.response?.status === 401) {
						setUser(null);
					} else {
						// Re-throw unexpected errors
						throw authError;
					}
				}
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("[navbar] Auth check failed:", error);
		}
	};

	useEffect(() => {
		checkAuth();
	}, [pathname]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUser(null);
		router.push("/");
	};

	const isActive = (path: string) => pathname === path;

	const navItems = [
		{ href: "/", label: "Beranda", icon: Home },
		{ href: "/search", label: "Cari Siswa", icon: Search },
	];

	const dashboardItems =
		user?.role === "TEACHER"
			? [{ href: "/dashboard/teacher", label: "Dashboard Guru", icon: Users }]
			: [
					{
						href: "/dashboard/student",
						label: "Dashboard Siswa",
						icon: Briefcase,
					},
			  ];

	return (
		<>
			<nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						{/* Logo and Brand */}
						<div className="flex items-center">
							<Link href="/" className="flex items-center space-x-2">
								<div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
									<GraduationCap className="h-6 w-6 text-white" />
								</div>
								<span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									SisTerKadu
								</span>
							</Link>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-8">
							{/* Public Navigation */}
							{navItems.map((item) => {
								const Icon = item.icon;
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
											isActive(item.href)
												? "bg-blue-100 text-blue-700"
												: "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
										}`}
									>
										<Icon className="h-4 w-4" />
										<span>{item.label}</span>
									</Link>
								);
							})}

							{/* Authenticated Navigation */}
							{user && (
								<>
									{dashboardItems.map((item) => {
										const Icon = item.icon;
										return (
											<Link
												key={item.href}
												href={item.href}
												className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
													isActive(item.href)
														? "bg-blue-100 text-blue-700"
														: "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
												}`}
											>
												<Icon className="h-4 w-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}

									{/* User Menu */}
									<div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
										<div className="relative">
											<button
												onClick={() => setIsDropdownOpen(!isDropdownOpen)}
												className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
											>
												<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
													{user.avatar ? (
														<img
															src={`http://localhost:3001${user.avatar}`}
															alt={user.name}
															className="w-full h-full object-cover"
															onError={(e) => {
																// Fallback to user icon if image fails to load
																e.currentTarget.style.display = "none";
																e.currentTarget.parentElement!.innerHTML =
																	'<svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
															}}
														/>
													) : (
														<User className="h-4 w-4 text-white" />
													)}
												</div>
												<div className="hidden lg:block text-left">
													<p className="text-sm font-medium text-gray-900">
														{user.name}
													</p>
													<p className="text-xs text-gray-500">
														{user.role === "TEACHER" ? "Guru" : "Siswa"}
													</p>
												</div>
												<ChevronDown className="h-4 w-4 text-gray-500" />
											</button>

											{/* Dropdown Menu */}
											{isDropdownOpen && (
												<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
													<div className="py-1">
														<Link
															href={`/profile/${user.id}`}
															className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
															onClick={() => setIsDropdownOpen(false)}
														>
															<Edit className="h-4 w-4 mr-2" />
															Edit Profile
														</Link>
														<button
															onClick={() => {
																setIsDropdownOpen(false);
																setIsLogoutDialogOpen(true);
															}}
															className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
														>
															<LogOut className="h-4 w-4 mr-2" />
															Logout
														</button>
													</div>
												</div>
											)}
										</div>
									</div>
								</>
							)}

							{/* Login/Register for non-authenticated users */}
							{!user && (
								<div className="flex items-center space-x-4">
									<Link href="/login">
										<Button variant="outline" size="sm">
											Masuk
										</Button>
									</Link>
									<Link href="/register">
										<Button size="sm">Daftar</Button>
									</Link>
								</div>
							)}
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden flex items-center">
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
							>
								{isMenuOpen ? (
									<X className="block h-6 w-6" />
								) : (
									<Menu className="block h-6 w-6" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
							{/* Public Navigation */}
							{navItems.map((item) => {
								const Icon = item.icon;
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
											isActive(item.href)
												? "bg-blue-100 text-blue-700"
												: "text-gray-700 hover:text-blue-600 hover:bg-white"
										}`}
										onClick={() => setIsMenuOpen(false)}
									>
										<Icon className="h-5 w-5" />
										<span>{item.label}</span>
									</Link>
								);
							})}

							{/* Authenticated Navigation */}
							{user && (
								<>
									{dashboardItems.map((item) => {
										const Icon = item.icon;
										return (
											<Link
												key={item.href}
												href={item.href}
												className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
													isActive(item.href)
														? "bg-blue-100 text-blue-700"
														: "text-gray-700 hover:text-blue-600 hover:bg-white"
												}`}
												onClick={() => setIsMenuOpen(false)}
											>
												<Icon className="h-5 w-5" />
												<span>{item.label}</span>
											</Link>
										);
									})}

									{/* User Info */}
									<div className="px-3 py-2 border-t border-gray-200 mt-4">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
												<User className="h-5 w-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">
													{user.name}
												</p>
												<p className="text-sm text-gray-500">
													{user.role === "TEACHER" ? "Guru" : "Siswa"}
												</p>
											</div>
										</div>
										<div className="mt-3 space-y-2">
											<Link
												href={`/profile/${user.id}`}
												onClick={() => setIsMenuOpen(false)}
												className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
											>
												<Edit className="h-4 w-4 mr-2" />
												Edit Profile
											</Link>
											<Button
												onClick={() => {
													setIsLogoutDialogOpen(true);
													setIsMenuOpen(false);
												}}
												variant="outline"
												size="sm"
												className="w-full flex items-center justify-center space-x-2"
											>
												<LogOut className="h-4 w-4" />
												<span>Keluar</span>
											</Button>
										</div>
									</div>
								</>
							)}

							{/* Login/Register for mobile */}
							{!user && (
								<div className="px-3 py-2 space-y-2 border-t border-gray-200 mt-4">
									<Link href="/login" onClick={() => setIsMenuOpen(false)}>
										<Button variant="outline" size="sm" className="w-full">
											Masuk
										</Button>
									</Link>
									<Link href="/register" onClick={() => setIsMenuOpen(false)}>
										<Button size="sm" className="w-full">
											Daftar
										</Button>
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</nav>

			{/* Logout Confirmation Dialog */}
			<Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Konfirmasi Keluar</DialogTitle>
						<DialogDescription>
							Apakah Anda yakin ingin keluar dari akun Anda?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsLogoutDialogOpen(false)}
						>
							Batal
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								handleLogout();
								setIsLogoutDialogOpen(false);
							}}
						>
							Keluar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
