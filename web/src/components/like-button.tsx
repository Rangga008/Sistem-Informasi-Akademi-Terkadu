"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	getProjectLikeCount,
	isProjectLiked,
	likeProject,
	unlikeProject,
} from "@/lib/api";

type LikeButtonProps = {
	projectId: string;
	className?: string;
	showCount?: boolean;
};

export default function LikeButton({
	projectId,
	className,
	showCount = true,
}: LikeButtonProps) {
	const [isLiked, setIsLiked] = useState(false);
	const [likeCount, setLikeCount] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			try {
				const token =
					typeof window !== "undefined" ? localStorage.getItem("token") : null;

				if (token) {
					const [likedRes, countRes] = await Promise.all([
						isProjectLiked(projectId).catch(() => ({ isLiked: false })),
						getProjectLikeCount(projectId).catch(() => ({ count: 0 })),
					]);
					if (!mounted) return;
					setIsLiked(!!likedRes.isLiked);
					setLikeCount(typeof countRes.count === "number" ? countRes.count : 0);
				} else {
					const countRes = await getProjectLikeCount(projectId).catch(() => ({
						count: 0,
					}));
					if (!mounted) return;
					setIsLiked(false);
					setLikeCount(typeof countRes.count === "number" ? countRes.count : 0);
				}
			} catch {
				if (!mounted) return;
				setIsLiked(false);
				setLikeCount((prev) => prev ?? 0);
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, [projectId]);

	const toggle = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) {
			window.location.href = "/login";
			setLoading(false);
			return;
		}

		// Optimistic update
		setIsLiked((prev) => !prev);
		setLikeCount((prev) => (prev == null ? prev : prev + (isLiked ? -1 : 1)));

		try {
			if (!isLiked) {
				await likeProject(projectId);
			} else {
				await unlikeProject(projectId);
			}
			// Refresh definitive count
			const fresh = await getProjectLikeCount(projectId);
			setLikeCount(fresh.count);
		} catch {
			// rollback
			setIsLiked((prev) => !prev);
			setLikeCount((prev) => (prev == null ? prev : prev + (isLiked ? 1 : -1)));
		} finally {
			setLoading(false);
		}
	}, [isLiked, projectId, loading]);

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={toggle}
			disabled={loading}
			className={className}
		>
			<Heart className="w-4 h-4 mr-1" />
			{isLiked ? "Disukai" : "Suka"}
			{showCount && likeCount != null && (
				<span className="ml-2 text-xs text-gray-500">{likeCount}</span>
			)}
		</Button>
	);
}
