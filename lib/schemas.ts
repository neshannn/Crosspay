import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  role: z.string(),
  rememberMe: z.boolean().optional(),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({
      message: "Email is required",
    }),
    password: z.string().min(8, {
      message: "Minimum 8 characters required",
    }),
    confirmPassword: z.string().min(8, {
      message: "Minimum 8 characters required",
    }),
    name: z.string().min(2, {
      message: "Name must be at least 2 characters",
    }),
    role: z.string(),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 digits",
    }).max(15, {
      message: "Phone number must be at most 15 digits",
    }).regex(/^[0-9+]+$/, {
      message: "Phone number can only contain digits and +",
    }),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
