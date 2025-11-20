"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Project {
	id: string;
	title: string;
	thumbnail?: string | null;
	images?: string[];
}

interface UnhighlightModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentHighlights: Project[];
	onUnhighlight: (projectId: string) => Promise<void>;
	onComplete: () => void;
}

export default function UnhighlightModal({
	open,
	onOpenChange,
	currentHighlights,
	onUnhighlight,
	onComplete,
}: UnhighlightModalProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleUnhighlight = async () => {
		if (!selectedId) return;
		setLoading(true);
		try {
			await onUnhighlight(selectedId);
			onComplete();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to unhighlight:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Maksimal 3 Project Highlight</DialogTitle>
					<DialogDescription>
						Anda sudah memiliki 3 project highlight. Pilih satu untuk
						di-unhighlight terlebih dahulu.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 max-h-96 overflow-y-auto">
					{currentHighlights.map((project) => (
						<div
							key={project.id}
							className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
							onClick={() => setSelectedId(project.id)}
						>
							<Checkbox
								checked={selectedId === project.id}
								onCheckedChange={(checked) => {
									setSelectedId(checked ? project.id : null);
								}}
							/>
							<div className="flex-1 flex gap-3">
								{(project.thumbnail ||
									(project.images && project.images[0])) && (
									<div className="w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
										<img
											src={`http://localhost:3001${
												project.thumbnail || project.images![0]
											}`}
											alt={project.title}
											className="w-full h-full object-cover"
										/>
									</div>
								)}
								<div className="flex-1 min-w-0">
									<h4 className="font-medium text-gray-900">{project.title}</h4>
									<p className="text-sm text-gray-500">
										Project ID: {project.id}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						Batal
					</Button>
					<Button onClick={handleUnhighlight} disabled={!selectedId || loading}>
						{loading ? "Menghapus highlight..." : "Unhighlight"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
