"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ConfirmModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void | Promise<void>;
	loading?: boolean;
}

export default function ConfirmModal({
	open,
	onOpenChange,
	title,
	description,
	confirmText = "Konfirmasi",
	cancelText = "Batal",
	onConfirm,
	loading = false,
}: ConfirmModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description ? (
						<DialogDescription className="whitespace-pre-line">
							{description}
						</DialogDescription>
					) : null}
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						{cancelText}
					</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={loading}>
						{loading ? "Memproses..." : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
