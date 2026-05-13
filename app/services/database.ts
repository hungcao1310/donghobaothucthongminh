// Frontend service kết nối với backend API
const API_BASE_URL = "http://localhost:3002/api";

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

// ─── ALARM TYPES ──────────────────────────────────────────────────────────────

export interface AlarmData {
  id: number;
  time: string;
  hour: number;
  minute: number;
  days: string[];
  enabled: boolean;
  label: string;
  ringtone: string;
  ringtoneId?: number | null;
  smartMode: boolean;
  challengeType?: string;
  difficulty?: number;
  volume?: number;
  snoozeInterval?: number;
  snoozeLimit?: number;
  filePath?: string;
}

export interface SleepRecordData {
  id?: number;
  bedtime: string;
  wakeTime: string;
  quality: number;
  logDate: string;
}

export interface StopwatchRecordData {
  id?: number;
  totalTimeSeconds: number;
  recordedAt?: string;
}

// ─── USER HELPERS ─────────────────────────────────────────────────────────────

export function saveUserToLocal(user: User) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getUserFromLocal(): User | null {
  const data = localStorage.getItem("currentUser");
  return data ? JSON.parse(data) : null;
}

export function clearUserFromLocal() {
  localStorage.removeItem("currentUser");
}

export function isLoggedIn(): boolean {
  return !!getUserFromLocal();
}

function authHeaders(): HeadersInit {
  const user = getUserFromLocal();
  return {
    "Content-Type": "application/json",
    ...(user ? { "x-user-id": String(user.id) } : {}),
  };
}

// ─── AUTH API ─────────────────────────────────────────────────────────────────

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
      message: "Không thể kết nối đến server.",
    };
  }
}

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
      message: "Không thể kết nối đến server.",
    };
  }
}

// ─── ALARMS API ───────────────────────────────────────────────────────────────

export async function fetchAlarms(): Promise<{ success: boolean; alarms?: AlarmData[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/alarms`, {
      headers: authHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy danh sách báo thức:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

export async function createAlarm(alarm: {
  time: string;
  label: string;
  days: string[];
  enabled: boolean;
  smartMode: boolean;
  challengeType?: string;
  difficulty?: number;
  volume?: number;
  ringtoneId?: number | null;
}): Promise<{ success: boolean; message: string; alarmId?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/alarms`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(alarm),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi thêm báo thức:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

export async function updateAlarm(id: number, updates: Partial<AlarmData>): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/alarms/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi cập nhật báo thức:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

export async function deleteAlarm(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/alarms/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi xóa báo thức:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

export async function toggleAlarm(id: number): Promise<{ success: boolean; message: string; enabled?: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/alarms/${id}/toggle`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi toggle báo thức:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

// ─── RINGTONES API ────────────────────────────────────────────────────────────

export interface RingtoneData {
  id: number;
  name: string;
  filePath: string;
}

export async function fetchRingtones(): Promise<{ success: boolean; ringtones?: RingtoneData[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/ringtones`, {
      headers: authHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy danh sách nhạc chuông:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

// ─── SLEEP HEALTH API ─────────────────────────────────────────────────────────

export async function fetchSleepRecords(): Promise<{ success: boolean; records?: SleepRecordData[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/sleep`, {
      headers: authHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy dữ liệu giấc ngủ:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

export async function createSleepRecord(data: SleepRecordData): Promise<{ success: boolean; message: string; sleepId?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/sleep`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi thêm dữ liệu giấc ngủ:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

// ─── STOPWATCH HISTORY API ────────────────────────────────────────────────────

export async function fetchStopwatchRecords(): Promise<{ success: boolean; records?: StopwatchRecordData[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/stopwatch`, {
      headers: authHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi lấy lịch sử bấm giờ:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

export async function createStopwatchRecord(totalTimeSeconds: number): Promise<{ success: boolean; message: string; stopwatchId?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/stopwatch`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ totalTimeSeconds }),
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi lưu lịch sử bấm giờ:", error);
    return { success: false, message: "Lỗi kết nối server" };
  }
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}