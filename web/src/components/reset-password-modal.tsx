"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X } from "lucide-react";

interface ResetPasswordModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (oldPassword: string, newPassword: string) => Promise<void>;
}

export function ResetPasswordModal({
	open,
	onClose,
	onSubmit,
}: ResetPasswordModalProps) {
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	if (!open) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!oldPassword || !newPassword || !confirmPassword) {
			setError("Semua field wajib diisi");
			return;
		}

		if (newPassword.length < 6) {
			setError("Password baru minimal 6 karakter");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Konfirmasi password tidak cocok");
			return;
		}

		setLoading(true);
		try {
			await onSubmit(oldPassword, newPassword);
			// Reset form
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			onClose();
		} catch (err: any) {
			setError(err.response?.data?.message || "Gagal mengubah password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold text-gray-900">Ubah Password</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password Lama <span className="text-red-500">*</span>
						</label>
						<Input
							type="password"
							value={oldPassword}
							onChange={(e) => setOldPassword(e.target.value)}
							placeholder="Masukkan password lama"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password Baru <span className="text-red-500">*</span>
						</label>
						<Input
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="Masukkan password baru (min. 6 karakter)"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Konfirmasi Password Baru <span className="text-red-500">*</span>
						</label>
						<Input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Konfirmasi password baru"
						/>
					</div>

					{error && (
						<div className="text-red-600 text-sm bg-red-50 p-3 rounded">
							{error}
						</div>
					)}

					<div className="flex justify-end gap-2 mt-6">
						<Button type="button" variant="ghost" onClick={onClose}>
							Batal
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Menyimpan..." : "Simpan"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
