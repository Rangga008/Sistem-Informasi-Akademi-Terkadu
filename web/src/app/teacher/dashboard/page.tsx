"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherDashboard() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to the unified teacher dashboard
		router.replace("/dashboard/teacher");
	}, [router]);

	return null;
}
