// Frontend service kết nối với backend API
const API_BASE_URL = "http://localhost:3001/api";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

// Lưu thông tin user vào localStorage
export function saveUserToLocal(user: User) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Lấy thông tin user từ localStorage
export function getUserFromLocal(): User | null {
  const data = localStorage.getItem("currentUser");
  return data ? JSON.parse(data) : null;
}

// Xóa thông tin user (đăng xuất)
export function clearUserFromLocal() {
  localStorage.removeItem("currentUser");
}

// Kiểm tra đã đăng nhập chưa
export function isLoggedIn(): boolean {
  return !!getUserFromLocal();
}

// Đăng ký
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result: AuthResponse = await res.json();
    if (result.success && result.user) {
      saveUserToLocal(result.user);
    }
    return result;
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return {
      success: false,
      message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server backend.",
    };
  }
}

// Đăng nhập
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result: AuthResponse = await res.json();
    if (result.success && result.user) {
      saveUserToLocal(result.user);
    }
    return result;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return {
      success: false,
      message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server backend.",
    };
  }
}

// Kiểm tra kết nối server
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}
