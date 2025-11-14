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
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
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

export const getAllStudents = async () => {
	const response = await api.get("/users");
	return response.data;
};

export const getStudents = async () => {
	const response = await api.get("/users");
	return response;
};

export const approveProject = async (studentId: string, projectId: string) => {
	const response = await api.patch(`/projects/${projectId}`, {
		highlight: true,
	});
	return response.data;
};

export const approveStudent = async (studentId: string) => {
	const response = await api.post(`/users/${studentId}/approve`);
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

export default api;
