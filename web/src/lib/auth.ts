import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "./api";

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const response = await login(credentials.email, credentials.password);
					const user = response.user;
					const token = response.access_token;

					if (user && token) {
						return {
							id: user.id,
							email: user.email,
							name: user.name,
							role: user.role,
							token,
						};
					}
					return null;
				} catch (error) {
					console.error("Login error:", error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.accessToken = user.token;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.sub!;
				session.user.role = token.role as string;
				session.accessToken = token.accessToken as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt" as const,
	},
};

export default NextAuth(authOptions);
