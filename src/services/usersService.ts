import type { CreateUserRequest, User } from "../types/user";
import { http } from "./http";

export const usersService = {
  async listUsers(): Promise<User[]> {
    const { data } = await http.get<User[]>("/api/users");
    return data;
  },

  async createUser(payload: CreateUserRequest): Promise<User> {
    const { data } = await http.post<User>("/api/users", payload);
    return data;
  },
};

