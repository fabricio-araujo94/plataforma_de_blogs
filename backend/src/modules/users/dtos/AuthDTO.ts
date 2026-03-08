import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "The name must be at least 2 characters long."),
  email: z.email("Invalid e-mail."),
  password: z
    .string()
    .min(8, "The password must be at least 8 characters long."),
});

export const loginSchema = z.object({
  email: z.email("Invalid e-mail."),
  password: z.string().min(1, "Password is required"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
