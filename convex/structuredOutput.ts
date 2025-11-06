import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { medicalOutputSchema } from "./schemas/medicalOutput";
import {
	SYSTEM_PROMPT,
	generateExtractionPrompt,
	getTemplateBySpecialization,
} from "./prompts/medicalExtraction";
import { query } from "./_generated/server";

export const generateStructuredOutput = action({
	args: {
		documentId: v.id("diagnosisDocuments"),
		specialization: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		try {
			await ctx.runMutation(internal.structuredOutput.updateStructuredOutputStatus, {
				documentId: args.documentId,
				status: "processing",
			});

			const document = await ctx.runQuery(internal.structuredOutput.getDocument, {
				documentId: args.documentId,
			});

			if (!document) {
				throw new Error("Document not found");
			}

			if (!document.transcript) {
				throw new Error("No transcript available. Generate transcript first.");
			}

			const template = args.specialization
				? getTemplateBySpecialization(args.specialization)
				: undefined;

			const userPrompt = generateExtractionPrompt(document.transcript, template);

			// Use generateObject instead of generateText for enforced schema validation
			const { object: structuredOutput } = await generateObject({
				model: google("gemini-2.5-flash"),
				schema: medicalOutputSchema,
				system: SYSTEM_PROMPT,
				prompt: userPrompt,
				temperature: 0.1,
			});

			// Output is already validated by generateObject, no need to parse or validate again

			await ctx.runMutation(internal.structuredOutput.updateStructuredOutput, {
				documentId: args.documentId,
				structuredOutput,
				status: "completed",
			});

			return {
				success: true,
				structuredOutput,
			};
		} catch (error) {
			await ctx.runMutation(internal.structuredOutput.updateStructuredOutputStatus, {
				documentId: args.documentId,
				status: "failed",
			});

			throw error;
		}
	},
});

export const updateStructuredOutputStatus = internalMutation({
	args: {
		documentId: v.id("diagnosisDocuments"),
		status: v.union(
			v.literal("pending"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed"),
		),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.documentId, {
			structuredOutputStatus: args.status,
			dateLastModified: Date.now(),
		});
	},
});

export const updateStructuredOutput = internalMutation({
	args: {
		documentId: v.id("diagnosisDocuments"),
		structuredOutput: v.any(),
		status: v.union(
			v.literal("pending"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed"),
		),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.documentId, {
			structuredOutput: args.structuredOutput,
			structuredOutputStatus: args.status,
			dateLastModified: Date.now(),
		});
	},
});

export const getDocument = internalQuery({
	args: {
		documentId: v.id("diagnosisDocuments"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.documentId);
	},
});

export const getStructuredOutputStatus = query({
	args: {
		documentId: v.id("diagnosisDocuments"),
	},
	handler: async (ctx, args) => {
		const document = await ctx.db.get(args.documentId);
		if (!document) {
			return null;
		}

		return {
			status: document.structuredOutputStatus || "pending",
			structuredOutput: document.structuredOutput,
			dateLastModified: document.dateLastModified,
		};
	},
});

/**
 * Utility action to test the extraction with sample data
 * Can be removed in production
 */
export const testExtraction = action({
	args: {
		transcript: v.string(),
		specialization: v.optional(v.string()),
	},
	handler: async (_ctx, args) => {
		const template = args.specialization
			? getTemplateBySpecialization(args.specialization)
			: undefined;

		const userPrompt = generateExtractionPrompt(args.transcript, template);

		// Use generateObject instead of generateText for enforced schema validation
		const result = await generateObject({
			model: google("gemini-2.5-flash"),
			schema: medicalOutputSchema,
			system: SYSTEM_PROMPT,
			prompt: userPrompt,
			temperature: 0.1,
		});

		return {
			raw: JSON.stringify(result.object, null, 2),
			parsed: result.object,
		};
	},
});
