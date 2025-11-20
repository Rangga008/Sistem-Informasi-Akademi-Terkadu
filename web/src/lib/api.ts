import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
	try {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn("[api] request interceptor error reading token", e);
	}
	return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const hadAuthHeader = Boolean(
			error?.config?.headers?.Authorization ||
				error?.config?.headers?.authorization
		);
		if (error.response?.status === 401 && hadAuthHeader) {
			try {
				localStorage.removeItem("token");
			} catch {}
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
		if (error.response?.status === 403) {
			if (typeof window !== "undefined") {
				window.location.href = "/403";
			}
		}
		if (error.response?.status === 500) {
			if (typeof window !== "undefined") {
				window.location.href = "/500";
			}
		}
		return Promise.reject(error);
	}
);

export const searchStudents = async (query: string) => {
	const response = await api.get(
		`/users/search?q=${encodeURIComponent(query)}`
	);
	return response;
};

export const getStudentProfile = async (id: string) => {
	const response = await api.get(`/users/${id}`);
	return response.data;
};

export const login = async (email: string, password: string) => {
	const response = await api.post("/auth/login", { email, password });
	return response.data;
};

export const register = async (userData: any) => {
	const response = await api.post("/auth/register", userData);
	return response.data;
};

export const getCurrentUser = async () => {
	const response = await api.post("/auth/profile");
	return response.data;
};

export const createStudent = async (studentData: any) => {
	const response = await api.post("/users", studentData);
	return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
	const response = await api.patch(`/users/${userId}`, userData);
	return response.data;
};

export const deleteUser = async (userId: string) => {
	const response = await api.delete(`/users/${userId}`);
	return response.data;
};

export const getAllStudents = async () => {
	const response = await api.get("/users");
	return response.data;
};

export const getStudents = async () => {
	const response = await api.get("/users");
	return response;
};

// Removed approveProject and approveStudent - no longer needed

// Password reset
export const resetPasswordSelf = async (
	oldPassword: string,
	newPassword: string
) => {
	const response = await api.post("/auth/reset-password", {
		oldPassword,
		newPassword,
	});
	return response.data;
};

export const resetPasswordAdmin = async (
	targetUserId: string,
	newPassword: string
) => {
	const response = await api.post("/auth/reset-password-admin", {
		targetUserId,
		newPassword,
	});
	return response.data;
};

export const addSkill = async (userId: string, skillName: string) => {
	const response = await api.post(`/skills/${userId}`, { name: skillName });
	return response.data;
};

export const getUserSkills = async (userId: string) => {
	const response = await api.get(`/skills?userId=${userId}`);
	return response.data;
};

export const addProject = async (userId: string, projectData: FormData) => {
	const response = await api.post(`/projects/${userId}`, projectData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
};

export const getUserProjects = async (userId: string) => {
	const response = await api.get(`/projects?userId=${userId}`);
	return response.data;
};

export const updateProject = async (projectId: string, projectData: any) => {
	const response = await api.patch(`/projects/${projectId}`, projectData);
	return response.data;
};

export const deleteProject = async (projectId: string) => {
	const response = await api.delete(`/projects/${projectId}`);
	return response.data;
};

// Likes
export const likeProject = async (projectId: string) => {
	const response = await api.post(`/project-likes/${projectId}`);
	return response.data;
};

export const unlikeProject = async (projectId: string) => {
	const response = await api.delete(`/project-likes/${projectId}`);
	return response.data;
};

export const isProjectLiked = async (projectId: string) => {
	const response = await api.get(`/project-likes/is-liked/${projectId}`);
	return response.data as { isLiked: boolean };
};

export const getProjectLikeCount = async (projectId: string) => {
	const response = await api.get(`/project-likes/count/${projectId}`);
	return response.data as { count: number };
};

// Follow
export const followUser = async (userId: string) => {
	const response = await api.post(`/follow/${userId}`);
	return response.data;
};

export const unfollowUser = async (userId: string) => {
	const response = await api.delete(`/follow/${userId}`);
	return response.data;
};

export const isFollowingUser = async (userId: string) => {
	const response = await api.get(`/follow/is-following/${userId}`);
	return response.data as { isFollowing: boolean };
};

export const getFollowStats = async (userId: string) => {
	const response = await api.get(`/follow/stats/${userId}`);
	return response.data as { followers: number; following: number };
};

export const getFollowersList = async (userId: string) => {
	const response = await api.get(`/follow/followers/${userId}`);
	return response.data as Array<{
		id: string;
		name: string;
		email?: string;
		avatar?: string;
		role?: string;
		bio?: string;
	}>;
};

export const getFollowingList = async (userId: string) => {
	const response = await api.get(`/follow/following/${userId}`);
	return response.data as Array<{
		id: string;
		name: string;
		email?: string;
		avatar?: string;
		role?: string;
		bio?: string;
	}>;
};

// Landing page helpers
export const getTopStudents = async (limit = 10) => {
	const response = await api.get(`/users/top-students?limit=${limit}`);
	return response.data as Array<{
		id: string;
		name: string;
		bio?: string;
		avatar?: string;
		skills?: { name: string }[];
		projects?: {
			id: string;
			title: string;
			description: string;
			images: string[];
		}[];
		_count?: { projects: number };
	}>;
};

export const getHighlightProjects = async () => {
	const response = await api.get(`/projects`);
	return response.data as Array<{
		id: string;
		title: string;
		description: string;
		images: string[];
		thumbnail?: string | null;
		user: { id: string; name: string };
		createdAt: string;
	}>;
};

export const getOverviewStats = async () => {
	const response = await api.get(`/stats/overview`);
	return response.data as {
		students: number;
		teachers: number;
		projectsHighlight: number;
		skillsDistinct: number;
	};
};

export default api;
