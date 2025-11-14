import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "SisTerKadu - Platform Portofolio Siswa",
	description:
		"Temukan talenta siswa berbakat dengan platform portofolio modern. Guru mengelola, siswa memamerkan karya, dunia melihat potensi.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id">
			<body className={`${inter.className} antialiased`}>
				<Providers>
					<Navbar />
					<main className="min-h-screen">{children}</main>
				</Providers>
			</body>
		</html>
	);
}
