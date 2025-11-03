import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { medicalOutputSchema } from "./schemas/medicalOutput";
import {
	SYSTEM_PROMPT,
	generateExtractionPrompt,
	getTemplateBySpecialization,
} from "./prompts/medicalExtraction";
import { jsonrepair } from "jsonrepair";
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

			const { text } = await generateText({
				model: google("gemini-2.5-flash-exp"),
				system: SYSTEM_PROMPT,
				prompt: userPrompt,
				temperature: 0.1,
			});

			let structuredOutput;
			try {
				const cleanedText = text.trim();
				const jsonText = cleanedText
					.replace(/^```json\s*/i, "")
					.replace(/^```\s*/, "")
					.replace(/```\s*$/, "");

				structuredOutput = JSON.parse(jsonText);
			} catch (parseError) {
				console.warn("JSON parsing failed, attempting repair:", parseError);
				try {
					const repairedJson = jsonrepair(text);
					structuredOutput = JSON.parse(repairedJson);
				} catch (repairError) {
					throw new Error(
						`Failed to parse LLM output as JSON: ${parseError}. Repair also failed: ${repairError}`,
					);
				}
			}

			const validatedOutput = medicalOutputSchema.parse(structuredOutput);

			await ctx.runMutation(internal.structuredOutput.updateStructuredOutput, {
				documentId: args.documentId,
				structuredOutput: validatedOutput,
				status: "completed",
			});

			return {
				success: true,
				structuredOutput: validatedOutput,
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
	handler: async (ctx, args) => {
		const template = args.specialization
			? getTemplateBySpecialization(args.specialization)
			: undefined;

		const userPrompt = generateExtractionPrompt(args.transcript, template);

		const { text } = await generateText({
			model: google("gemini-2.0-flash-exp"),
			system: SYSTEM_PROMPT,
			prompt: userPrompt,
			temperature: 0.1,
		});

		// Try to parse the response
		const cleanedText = text.trim();
		const jsonText = cleanedText
			.replace(/^```json\s*/i, "")
			.replace(/^```\s*/, "")
			.replace(/```\s*$/, "");

		let structuredOutput;
		try {
			structuredOutput = JSON.parse(jsonText);
		} catch (parseError) {
			const repairedJson = jsonrepair(jsonText);
			structuredOutput = JSON.parse(repairedJson);
		}

		const validatedOutput = medicalOutputSchema.parse(structuredOutput);

		return {
			raw: text,
			parsed: validatedOutput,
		};
	},
});
