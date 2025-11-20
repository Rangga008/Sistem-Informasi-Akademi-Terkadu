"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
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
	followUser,
	getCurrentUser,
	getFollowStats,
	isFollowingUser,
	unfollowUser,
} from "@/lib/api";

type FollowButtonProps = {
	targetUserId: string;
	className?: string;
	showCount?: boolean;
	hideIfSelf?: boolean;
};

export default function FollowButton({
	targetUserId,
	className,
	showCount = true,
	hideIfSelf = true,
}: FollowButtonProps) {
	const [isFollowing, setIsFollowing] = useState(false);
	const [followersCount, setFollowersCount] = useState<number | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			try {
				const token =
					typeof window !== "undefined" ? localStorage.getItem("token") : null;

				// Always fetch public stats
				const statsPromise = getFollowStats(targetUserId).catch(() => ({
					followers: 0,
					following: 0,
				}));

				if (token) {
					const [me, status, stats] = await Promise.all([
						getCurrentUser().catch(() => null),
						isFollowingUser(targetUserId).catch(() => ({
							isFollowing: false,
						})),
						statsPromise,
					]);
					if (!mounted) return;
					setCurrentUserId(me?.id || null);
					setIsFollowing(!!status.isFollowing);
					setFollowersCount(stats.followers ?? 0);
				} else {
					const stats = await statsPromise;
					if (!mounted) return;
					setCurrentUserId(null);
					setIsFollowing(false);
					setFollowersCount(stats.followers ?? 0);
				}
			} catch {
				if (!mounted) return;
				setCurrentUserId(null);
				setIsFollowing(false);
				setFollowersCount((prev) => prev ?? 0);
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, [targetUserId]);

	const performToggle = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) {
			window.location.href = "/login";
			setLoading(false);
			return;
		}

		// Optimistic
		setIsFollowing((prev) => !prev);
		setFollowersCount((prev) =>
			prev == null ? prev : prev + (isFollowing ? -1 : 1)
		);

		try {
			if (!isFollowing) {
				await followUser(targetUserId);
			} else {
				await unfollowUser(targetUserId);
			}
			const fresh = await getFollowStats(targetUserId);
			setFollowersCount(fresh.followers);
		} catch {
			// rollback
			setIsFollowing((prev) => !prev);
			setFollowersCount((prev) =>
				prev == null ? prev : prev + (isFollowing ? 1 : -1)
			);
		} finally {
			setLoading(false);
		}
	}, [isFollowing, targetUserId, loading]);

	if (hideIfSelf && currentUserId && currentUserId === targetUserId) {
		return null;
	}

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setConfirmOpen(true)}
				disabled={loading}
				className={className}
			>
				<Heart className="w-4 h-4 mr-2" />
				{isFollowing ? "Mengikuti" : "Ikuti"}
				{showCount && followersCount != null && (
					<span className="ml-2 text-xs text-gray-500">{followersCount}</span>
				)}
			</Button>

			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{isFollowing ? "Berhenti mengikuti?" : "Ikuti pengguna ini?"}
						</DialogTitle>
						<DialogDescription>
							{isFollowing
								? "Anda tidak akan menerima pembaruan dari pengguna ini lagi."
								: "Anda akan mulai menerima pembaruan dari pengguna ini."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmOpen(false)}>
							Batal
						</Button>
						<Button
							onClick={async () => {
								await performToggle();
								setConfirmOpen(false);
							}}
							disabled={loading}
						>
							{isFollowing ? "Unfollow" : "Ikuti"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
