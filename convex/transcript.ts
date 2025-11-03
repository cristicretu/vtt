import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * TODO: Replace this with actual API call
 */
async function mockTranscriptionAPI(audioUrl: string): Promise<string> {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const mockTranscripts = [
		"Pacientul se prezintă cu durere acută în regiunea lombară. Simptomele au început acum aproximativ 3 zile. Nu are antecedente de traume. Durerea este descrisă ca fiind ascuțită și radiază pe piciorul stâng. Pacientul raportează dificultăți de somn și mobilitate limitată. I s-au prescris medicamente antiinflamatoare și s-a recomandat fizioterapie.",
		"Consultație ulterioară pentru gestionarea hipertensiunii arteriale. Tensiunea arterială arată o îmbunătățire de la 150/95 la 135/85 mmHg. Pacientul raportează o bună respectare a schemei medicamentoase. Nu s-au observat efecte adverse. Modificările dietei arată rezultate pozitive. Continuați planul de tratament actual și programați următorul control peste 4 săptămâni",
		"Consultație inițială pentru dureri de cap persistente care apar de 3-4 ori pe săptămână în ultima lună. Pacientul descrie dureri pulsatile în principal în regiunea frontală. Factorii declanșatori includ stresul și lipsa somnului. Nu există tulburări de vedere sau simptome neurologice. Se recomandă modificări ale stilului de viață, tehnici de gestionare a stresului și prescrierea medicației profilactice.",
	];

	return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
}

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

			// TODO: Replace mockTranscriptionAPI with actual API call
			const transcript = await mockTranscriptionAPI(audioUrl);

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
