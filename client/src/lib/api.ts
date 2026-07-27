import { API_URL } from "./utils";

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.status === 401 && path !== "/auth/refresh" && path !== "/auth/login") {
      const refreshed = await this.refresh();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.accessToken}`;
        const retry = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
        if (!retry.ok) {
          const err = await retry.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || "Request failed");
        }
        return retry.json();
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

    if (res.status === 204) return {} as T;
    return res.json();
  }

  async refresh() {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      this.accessToken = data.accessToken;
      return data;
    } catch {
      return null;
    }
  }

  register(email: string, password: string, role: "SEEKER" | "REFERRER") {
    return this.request<{ accessToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  }

  login(email: string, password: string) {
    return this.request<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  getMe() {
    return this.request<MeResponse>("/me");
  }

  updateSeekerProfile(data: Partial<SeekerProfile>) {
    return this.request<SeekerProfile>("/me/seeker-profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  updateReferrerProfile(data: Partial<ReferrerProfile>) {
    return this.request<ReferrerProfile>("/me/referrer-profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  uploadResume(file: File) {
    const form = new FormData();
    form.append("resume", file);
    return this.request<Resume>("/me/resume", { method: "POST", body: form });
  }

  deleteResume() {
    return this.request("/me/resume", { method: "DELETE" });
  }

  private async fetchResumeBlob(path: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;
    const res = await fetch(`${API_URL}${path}`, { headers, credentials: "include" });
    if (res.status === 401) {
      const refreshed = await this.refresh();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.accessToken}`;
        const retry = await fetch(`${API_URL}${path}`, { headers, credentials: "include" });
        if (!retry.ok) throw new Error("Failed to fetch resume");
        return retry.blob();
      }
    }
    if (!res.ok) throw new Error("Failed to fetch resume");
    return res.blob();
  }

  fetchMyResume(inline = false) {
    const qs = inline ? "?inline=1" : "";
    return this.fetchResumeBlob(`/me/resume${qs}`);
  }

  fetchSeekerResume(seekerId: string, inline = false) {
    const qs = inline ? "?inline=1" : "";
    return this.fetchResumeBlob(`/seekers/${seekerId}/resume${qs}`);
  }

  async downloadMyResume(fileName: string) {
    const blob = await this.fetchMyResume(false);
    this.triggerDownload(blob, fileName);
  }

  getSeekers(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString();
    return this.request<PaginatedSeekers>(`/seekers?${qs}`);
  }

  getSeeker(id: string) {
    return this.request<SeekerDetail>(`/seekers/${id}`);
  }

  getInterests() {
    return this.request<Interest[]>(`/interests`);
  }

  createInterest(seekerId: string, message?: string) {
    return this.request<Interest>("/interests", {
      method: "POST",
      body: JSON.stringify({ seekerId, message }),
    });
  }

  updateInterest(id: string, status: "ACCEPTED" | "DECLINED") {
    return this.request<Interest>(`/interests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  getConversations() {
    return this.request<Conversation[]>(`/conversations`);
  }

  getMessages(conversationId: string) {
    return this.request<Message[]>(`/conversations/${conversationId}/messages`);
  }

  sendMessage(conversationId: string, content: string) {
    return this.request<Message>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async downloadResume(seekerId: string, fileName: string) {
    const blob = await this.fetchSeekerResume(seekerId, false);
    this.triggerDownload(blob, fileName);
  }

  private triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export interface User {
  id: string;
  email: string;
  role: "SEEKER" | "REFERRER" | null;
}

export interface SeekerProfile {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  skills: string[];
  desiredRoles: string[];
  experienceYears: number;
  location: string;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  noticePeriod?: string;
  salaryExpectation?: string;
  immediateJoining?: boolean;
  isProfileComplete: boolean;
  updatedAt: string;
}

export interface ReferrerProfile {
  id: string;
  fullName: string;
  company: string;
  jobTitle: string;
  department?: string | null;
  bio?: string | null;
}

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface MeResponse extends User {
  avatarUrl?: string | null;
  seekerProfile?: SeekerProfile | null;
  referrerProfile?: ReferrerProfile | null;
  resume?: Resume | null;
}

export interface SeekerCard {
  id: string;
  fullName: string;
  headline: string;
  bio?: string;
  skills: string[];
  desiredRoles: string[];
  experienceYears: number;
  location: string;
  noticePeriod?: string;
  salaryExpectation?: string;
  immediateJoining?: boolean;
  profileUpdatedAt?: string;
  avatarUrl?: string | null;
  interest?: { id: string; status: string } | null;
}

export interface PaginatedSeekers {
  data: SeekerCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SeekerDetail extends SeekerCard {
  bio: string;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  email?: string | null;
  resume?: Resume | null;
  interest?: { id: string; status: string; message?: string | null; conversationId?: string } | null;
}

export interface Interest {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  message?: string | null;
  createdAt: string;
  referrer: {
    id: string;
    email: string;
    avatarUrl?: string | null;
    referrerProfile?: { fullName: string; company: string; jobTitle: string } | null;
  };
  seeker: {
    id: string;
    email: string;
    avatarUrl?: string | null;
    seekerProfile?: { fullName: string; headline: string; skills: string[]; desiredRoles?: string[] } | null;
  };
  conversation?: { id: string } | null;
}

export interface Conversation {
  id: string;
  interest: Interest;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  readAt?: string | null;
  sender: { id: string; avatarUrl?: string | null };
}

export const api = new ApiClient();
