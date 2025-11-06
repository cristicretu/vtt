import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const generateUploadUrl = mutation(async (ctx) => {
	return await ctx.storage.generateUploadUrl();
});

export const createDiagnosisDocument = mutation({
	args: {
		patientId: v.id("patients"),
		storageId: v.id("_storage"),
		metadata: v.object({
			originalFilename: v.string(),
			mimeType: v.string(),
			fileSize: v.number(),
		}),
	},
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in.");
		}

		// Verify the patient belongs to this doctor
		const patient = await ctx.db.get(args.patientId);
		if (!patient) {
			throw new Error("Patient not found.");
		}
		if (patient.doctorId !== userId) {
			throw new Error("You don't have permission to create documents for this patient.");
		}

		const documentId = await ctx.db.insert("diagnosisDocuments", {
			patientId: args.patientId,
			doctorId: userId,
			storageId: args.storageId,
			transcript: "",
			transcriptStatus: "pending",
			structuredOutputStatus: "pending",
			audioMetadata: {
				fileSize: args.metadata.fileSize,
				mimeType: args.metadata.mimeType,
				format: args.metadata.mimeType,
			},
			dateCreated: Date.now(),
			dateLastModified: Date.now(),
		});

		return documentId;
	},
});

export const getDiagnosisDocumentsForPatient = query({
	args: { patientId: v.id("patients") },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in.");
		}

		// Verify the patient belongs to this doctor
		const patient = await ctx.db.get(args.patientId);
		if (!patient) {
			throw new Error("Patient not found.");
		}
		if (patient.doctorId !== userId) {
			throw new Error("You don't have permission to view documents for this patient.");
		}

		const documents = await ctx.db
			.query("diagnosisDocuments")
			.withIndex("patientId", (q) => q.eq("patientId", args.patientId))
			.order("desc")
			.collect();

		return Promise.all(
			documents.map(async (doc) => {
				let fileUrl = null;
				if (doc.storageId) {
					fileUrl = await ctx.storage.getUrl(doc.storageId);
				}
				return {
					...doc,
					fileUrl,
				};
			}),
		);
	},
});

export const getRecordingUrl = query({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId);
	},
});

export const getDiagnosisDocument = query({
	args: { documentId: v.id("diagnosisDocuments") },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in.");
		}

		const document = await ctx.db.get(args.documentId);
		if (!document) {
			throw new Error("Document not found");
		}

		// Verify the document belongs to this doctor
		if (document.doctorId !== userId) {
			throw new Error("You don't have permission to view this document.");
		}

		return document;
	},
});

export const deleteDiagnosisDocument = mutation({
	args: { documentId: v.id("diagnosisDocuments") },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in.");
		}

		// Get the document to delete the storage file
		const document = await ctx.db.get(args.documentId);
		if (!document) {
			throw new Error("Document not found");
		}

		// Verify the document belongs to this doctor
		if (document.doctorId !== userId) {
			throw new Error("You don't have permission to delete this document.");
		}

		// Delete the storage file if it exists
		if (document.storageId) {
			await ctx.storage.delete(document.storageId);
		}

		// Delete the document from the database
		await ctx.db.delete(args.documentId);
	},
});
