import type { AuthResponse, LoginRequest, SignupRequest } from "../types/auth";
import { http } from "./http";

export const authService = {
  async signup(payload: SignupRequest): Promise<AuthResponse | null> {
    const { data } = await http.post<Partial<AuthResponse>>("/api/auth/signup", payload);
    if (data.accessToken && data.role && data.userId !== undefined && data.expiresAt && data.tokenType) {
      return data as AuthResponse;
    }
    return null;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/api/auth/login", payload);
    return data;
  },
};

