// lib/schemas/contact.ts
// Shared contact-form validation schemas. Pure Zod, no directives.
// Safe to import from both client ('use client') and server route files.
import { z } from "zod";

export const recruiterSchema = z.object({
	userType: z.literal("recruiter"),
	email: z.string().email("Invalid email address").max(254),
	company: z
		.string()
		.min(2, "Company name must be at least 2 characters")
		.max(200),
	position: z
		.string()
		.min(2, "Position must be at least 2 characters")
		.max(200),
	jobDescription: z
		.string()
		.min(10, "Job description must be at least 10 characters")
		.max(5000),
	employmentType: z
		.string()
		.min(2, "Please specify the employment type")
		.max(200),
	interview: z
		.string()
		.min(2, "Please provide interview availability")
		.max(5000),
	workLocation: z.string().min(2, "Please specify the work location").max(200),
	locationDetails: z.string().max(200).optional(),
	message: z.string().max(5000).optional(),
});

export const clientSchema = z.object({
	userType: z.literal("client"),
	email: z.string().email("Invalid email address").max(254),
	name: z.string().min(2, "Name must be at least 2 characters").max(200),
	message: z
		.string()
		.min(10, "Message must be at least 10 characters")
		.max(5000),
	projectType: z
		.string()
		.min(2, "Project type must be at least 2 characters")
		.max(200),
	budget: z.string().max(200).optional(),
	timeline: z.string().max(200).optional(),
});

export const resumeSchema = z.object({
	userType: z.literal("resume_request"),
	email: z.string().email().max(254),
	jobDescription: z
		.string()
		.min(10, "Job description must be at least 10 characters")
		.max(5000),
	message: z.string().max(5000),
});

export const contactSchema = z.discriminatedUnion("userType", [
	recruiterSchema,
	clientSchema,
	resumeSchema,
]);

export type ContactFormData = z.infer<typeof contactSchema>;
