import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { type Infer, v } from "convex/values";

export const CURRENCIES = {
	USD: "usd",
	EUR: "eur",
} as const;
export const currencyValidator = v.union(v.literal(CURRENCIES.USD), v.literal(CURRENCIES.EUR));
export type Currency = Infer<typeof currencyValidator>;

export const INTERVALS = {
	MONTH: "month",
	YEAR: "year",
} as const;
export const intervalValidator = v.union(v.literal(INTERVALS.MONTH), v.literal(INTERVALS.YEAR));
export type Interval = Infer<typeof intervalValidator>;

export const PLANS = {
	FREE: "free",
	PRO: "pro",
} as const;
export const planKeyValidator = v.union(v.literal(PLANS.FREE), v.literal(PLANS.PRO));
export type PlanKey = Infer<typeof planKeyValidator>;

const priceValidator = v.object({
	stripeId: v.string(),
	amount: v.number(),
});
const pricesValidator = v.object({
	[CURRENCIES.USD]: priceValidator,
	[CURRENCIES.EUR]: priceValidator,
});

const schema = defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		username: v.optional(v.string()),
		imageId: v.optional(v.id("_storage")),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
		customerId: v.optional(v.string()),
		// Doctor-specific fields from the new schema
		surname: v.optional(v.string()),
		clinic: v.optional(v.string()),
		specialisation: v.optional(v.string()),
	})
		.index("email", ["email"])
		.index("customerId", ["customerId"]),
	plans: defineTable({
		key: planKeyValidator,
		stripeId: v.string(),
		name: v.string(),
		description: v.string(),
		prices: v.object({
			[INTERVALS.MONTH]: pricesValidator,
			[INTERVALS.YEAR]: pricesValidator,
		}),
	})
		.index("key", ["key"])
		.index("stripeId", ["stripeId"]),
	subscriptions: defineTable({
		userId: v.id("users"),
		planId: v.id("plans"),
		priceStripeId: v.string(),
		stripeId: v.string(),
		currency: currencyValidator,
		interval: intervalValidator,
		status: v.string(),
		currentPeriodStart: v.number(),
		currentPeriodEnd: v.number(),
		cancelAtPeriodEnd: v.boolean(),
	})
		.index("userId", ["userId"])
		.index("stripeId", ["stripeId"]),

	// Patients table. A patient is not tied to a single doctor.
	patients: defineTable({
		name: v.string(),
		surname: v.string(),
		dateOfBirth: v.number(), // Unix timestamp for date of birth
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		cnp: v.string(), // Romanian Personal Numerical Code
	})
		.index("cnp", ["cnp"])
		.index("email", ["email"])
		.index("phone", ["phone"]),

	// Diagnosis documents table, linking a specific doctor to a specific patient
	// for a single consultation.
	diagnosisDocuments: defineTable({
		doctorId: v.id("users"), // Links to the 'users' (doctors) table
		patientId: v.id("patients"),
		templateId: v.optional(v.id("documentTemplates")), // Link to the template used
		storageId: v.optional(v.id("_storage")), // Reference to the audio file in Convex storage
		transcript: v.optional(v.string()), // Optional until generated
		transcriptStatus: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("processing"),
				v.literal("completed"),
				v.literal("failed"),
			),
		),
		structuredOutput: v.optional(v.any()), // To store JSON from the LLM, optional until generated
		structuredOutputStatus: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("processing"),
				v.literal("completed"),
				v.literal("failed"),
			),
		),
		audioMetadata: v.optional(
			v.object({
				duration: v.optional(v.number()), // Duration in seconds
				fileSize: v.optional(v.number()), // File size in bytes
				format: v.optional(v.string()), // File format (e.g., "audio/webm", "audio/mp3")
				mimeType: v.optional(v.string()), // MIME type
			}),
		),
		dateCreated: v.number(), // Unix timestamp for creation date
		dateLastModified: v.number(), // Unix timestamp for last modification date
	})
		.index("doctorId", ["doctorId"])
		.index("patientId", ["patientId"])
		.index("transcriptStatus", ["transcriptStatus"])
		.index("structuredOutputStatus", ["structuredOutputStatus"]),

	// Table for storing document templates created by doctors
	documentTemplates: defineTable({
		name: v.string(),
		// TODO: This could be a more structured object
		// depending on how the template is structured in the future
		content: v.string(), // The content of the template
		doctorId: v.id("users"), // Link to the doctor who created the template
		dateCreated: v.number(), // Unix timestamp for creation date
		dateLastModified: v.number(), // Unix timestamp for last modification date
	}).index("doctorId", ["doctorId"]),
});

export default schema;
