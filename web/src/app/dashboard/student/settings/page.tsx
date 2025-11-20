"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { ResetPasswordModal } from "@/components/reset-password-modal";
import { resetPasswordSelf } from "@/lib/api";

export default function SettingsPage() {
	const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

	const handleResetPassword = async (
		oldPassword: string,
		newPassword: string
	) => {
		await resetPasswordSelf(oldPassword, newPassword);
		alert("Password berhasil diubah");
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
				<p className="text-gray-600 mt-1">Kelola pengaturan akun Anda</p>
			</div>

			{/* Security Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Keamanan</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between py-3 border-b">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
								<Key className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<p className="font-medium text-gray-900">Ubah Password</p>
								<p className="text-sm text-gray-600">
									Ubah password untuk keamanan akun Anda
								</p>
							</div>
						</div>
						<Button onClick={() => setResetPasswordOpen(true)}>
							Ubah Password
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Reset Password Modal */}
			<ResetPasswordModal
				open={resetPasswordOpen}
				onClose={() => setResetPasswordOpen(false)}
				onSubmit={handleResetPassword}
			/>
		</div>
	);
}
