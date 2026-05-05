import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface FacultyRef {
  id: number;
  name: string;
  email: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  registration_number?: string | null;
  photo?: string | null;
  is_faculty: boolean;
  faculty: FacultyRef | null;
}

// Login response data shape. Backend may return:
//   { token, user: { ..., is_faculty, faculty } }
// OR  { token, user, is_faculty, faculty }   (flags at the top level)
// We tolerate both — see useLogin.
export interface LoginResponse {
  token: string;
  user?: Partial<AuthUser> & { id: number; name: string; email: string };
  is_faculty?: boolean;
  faculty?: FacultyRef | null;
}
