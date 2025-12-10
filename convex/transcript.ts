import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { GROQ_API_KEY } from "./env";

/**
 * Transcribes audio using Groq Whisper API (whisper-large-v3)
 * Using Groq for testing since it's free
 */
async function transcribeAudioWithGroq(audioUrl: string): Promise<string> {
	if (!GROQ_API_KEY) {
		throw new Error("GROQ_API_KEY environment variable is not set");
	}

	// Download the audio file from Convex storage
	const audioResponse = await fetch(audioUrl);

	if (!audioResponse.ok) {
		throw new Error(`Failed to download audio file: ${audioResponse.statusText}`);
	}

	const audioBlob = await audioResponse.blob();

	// Prepare the form data for Groq API
	const formData = new FormData();
	formData.append("file", audioBlob, "audio.webm");
	formData.append("model", "whisper-large-v3");
	formData.append("language", "ro"); // Romanian language for better accuracy

	// Call Groq Whisper API
	const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${GROQ_API_KEY}`,
		},
		body: formData,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			`Groq API error: ${response.status} ${response.statusText}. ${
				errorData.error?.message || ""
			}`,
		);
	}

	const result = await response.json();

	if (!result.text) {
		throw new Error("No transcription text received from Groq API");
	}

	return result.text;
}

/**
 * Transcribes audio using OpenAI Whisper API
 * NOTE: Currently commented out - using Groq for testing since it's free
 */
// async function transcribeAudioWithWhisper(audioUrl: string): Promise<string> {
// 	if (!OPENAI_API_KEY) {
// 		throw new Error("OPENAI_API_KEY environment variable is not set");
// 	}

// 	// Download the audio file from Convex storage
// 	const audioResponse = await fetch(audioUrl);

// 	if (!audioResponse.ok) {
// 		throw new Error(`Failed to download audio file: ${audioResponse.statusText}`);
// 	}

// 	const audioBlob = await audioResponse.blob();

// 	// Prepare the form data for OpenAI API
// 	const formData = new FormData();
// 	formData.append("file", audioBlob, "audio.webm");
// 	formData.append("model", "whisper-1");
// 	formData.append("language", "ro"); // Romanian language for better accuracy

// 	// Call OpenAI Whisper API
// 	const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
// 		method: "POST",
// 		headers: {
// 			Authorization: `Bearer ${OPENAI_API_KEY}`,
// 		},
// 		body: formData,
// 	});

// 	if (!response.ok) {
// 		const errorData = await response.json().catch(() => ({}));
// 		throw new Error(
// 			`OpenAI API error: ${response.status} ${response.statusText}. ${
// 				errorData.error?.message || ""
// 			}`,
// 		);
// 	}

// 	const result = await response.json();

// 	if (!result.text) {
// 		throw new Error("No transcription text received from OpenAI API");
// 	}

// 	return result.text;
// }

export const generateTranscript = action({
	args: {
		documentId: v.id("diagnosisDocuments"),
	},
	handler: async (ctx, args) => {
		try {
			await ctx.runMutation(internal.transcript.updateTranscriptStatus, {
				documentId: args.documentId,
				status: "processing",
			});

			const document = await ctx.runQuery(internal.transcript.getDocument, {
				documentId: args.documentId,
			});

			if (!document) {
				throw new Error("Document not found");
			}

			if (!document.storageId) {
				throw new Error("No audio file attached to this document");
			}

			const audioUrl = await ctx.storage.getUrl(document.storageId);

			if (!audioUrl) {
				throw new Error("Audio file not found in storage");
			}

			// Transcribe audio using Groq Whisper API (using Groq for testing since it's free)
			// To switch back to OpenAI, uncomment transcribeAudioWithWhisper and comment transcribeAudioWithGroq
			const transcript = await transcribeAudioWithGroq(audioUrl);

			await ctx.runMutation(internal.transcript.updateTranscript, {
				documentId: args.documentId,
				transcript,
				status: "completed",
			});

			return { success: true, transcript };
		} catch (error) {
			// Update status to "failed" on error
			await ctx.runMutation(internal.transcript.updateTranscriptStatus, {
				documentId: args.documentId,
				status: "failed",
			});

			throw error;
		}
	},
});

export const updateTranscriptStatus = internalMutation({
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
			transcriptStatus: args.status,
			dateLastModified: Date.now(),
		});
	},
});

export const updateTranscript = internalMutation({
	args: {
		documentId: v.id("diagnosisDocuments"),
		transcript: v.string(),
		status: v.union(
			v.literal("pending"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed"),
		),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.documentId, {
			transcript: args.transcript,
			transcriptStatus: args.status,
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

export const getTranscriptStatus = query({
	args: {
		documentId: v.id("diagnosisDocuments"),
	},
	handler: async (ctx, args) => {
		const document = await ctx.db.get(args.documentId);
		if (!document) {
			return null;
		}

		return {
			status: document.transcriptStatus || "pending",
			transcript: document.transcript,
			dateLastModified: document.dateLastModified,
		};
	},
});
