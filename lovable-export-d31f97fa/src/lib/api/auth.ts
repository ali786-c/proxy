import { z } from "zod";
import { api, MessageSchema } from "./client";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["client", "admin", "banned"]),
  balance: z.number().default(0),
  referral_code: z.string().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = User["role"];

const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export const authApi = {
  me: () => api.get("/auth/me", UserSchema),
  login: (data: LoginInput) => api.post("/auth/login", AuthResponseSchema, data),
  signup: (data: SignupInput) => api.post("/auth/signup", AuthResponseSchema, data),
  logout: () => api.post("/auth/logout", MessageSchema),
};
