import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["DONOR", "RECEIVER"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const donorSchema = z.object({
  bloodGroup: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]),
  age: z.number().min(18, "Must be at least 18 years old").max(65, "Must be under 65 years old"),
  location: z.string().min(2, "Location is required"),
  contactNumber: z.string().min(10, "Valid contact number required"),
  lastDonationDate: z.string().optional().nullable(),
});

export const requestSchema = z.object({
  bloodGroup: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]),
  units: z.number().min(1, "At least 1 unit required").max(10, "Maximum 10 units"),
  urgency: z.enum(["NORMAL", "URGENT", "CRITICAL"]),
  location: z.string().min(2, "Location is required"),
  notes: z.string().optional(),
});

export const bloodStockUpdateSchema = z.object({
  bloodGroup: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]),
  units: z.number().min(0, "Units cannot be negative"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DonorInput = z.infer<typeof donorSchema>;
export type RequestInput = z.infer<typeof requestSchema>;
