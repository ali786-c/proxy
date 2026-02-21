import { z } from "zod";
import { api, MessageSchema } from "./client";

// ── Schemas ──────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),                                      // Laravel int → cast to string in AuthController
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["client", "admin"]),
  balance: z.number().default(0),
  referral_code: z.string().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = User["role"];

const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),                                   // Laravel returns "token" key
});

// ── Validation schemas for forms ─────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be under 128 characters"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ── API calls ────────────────────────────────────────

export const authApi = {
  me: () => api.get("/auth/me", UserSchema),
  login: (data: LoginInput) => api.post("/auth/login", AuthResponseSchema, data),
  signup: (data: SignupInput) =>
    api.post("/auth/signup", AuthResponseSchema, data),
  logout: () => api.post("/auth/logout", MessageSchema),
};
