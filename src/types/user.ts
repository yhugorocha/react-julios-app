import type { Role } from "./auth";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

