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

interface StatusModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmText?: string;
}

export default function StatusModal({
	open,
	onOpenChange,
	title,
	description,
	confirmText = "Tutup",
}: StatusModalProps) {
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
					<Button onClick={() => onOpenChange(false)}>{confirmText}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
