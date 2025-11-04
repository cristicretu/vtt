import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const createPatient = mutation({
	args: {
		name: v.string(),
		surname: v.string(),
		dateOfBirth: v.number(),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		cnp: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in to create a patient.");
		}

		// Validate CNP format (13 digits)
		if (!/^\d{13}$/.test(args.cnp)) {
			throw new Error("Invalid CNP format. Must be 13 digits.");
		}

		// Check for duplicate CNP within this doctor's patients
		const existingPatient = await ctx.db
			.query("patients")
			.withIndex("doctorId", (q) => q.eq("doctorId", userId))
			.filter((q) => q.eq(q.field("cnp"), args.cnp))
			.first();

		if (existingPatient) {
			throw new Error("A patient with this CNP already exists in your records.");
		}

		const patientId = await ctx.db.insert("patients", {
			doctorId: userId,
			name: args.name,
			surname: args.surname,
			dateOfBirth: args.dateOfBirth,
			email: args.email,
			phone: args.phone,
			cnp: args.cnp,
		});

		return patientId;
	},
});

export const getPatient = query({
	args: { patientId: v.id("patients") },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in to view patients.");
		}

		const patient = await ctx.db.get(args.patientId);

		// Verify the patient belongs to this doctor
		if (patient && patient.doctorId !== userId) {
			throw new Error("You don't have permission to view this patient.");
		}

		return patient;
	},
});

export const listPatients = query({
	args: {
		search: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in to view patients.");
		}

		// Get only patients belonging to this doctor
		const patients = await ctx.db
			.query("patients")
			.withIndex("doctorId", (q) => q.eq("doctorId", userId))
			.order("desc")
			.collect();

		if (args.search) {
			// Filter the results based on search query
			return patients.filter(
				(p) =>
					p.name.toLowerCase().includes(args.search!.toLowerCase()) ||
					p.surname.toLowerCase().includes(args.search!.toLowerCase()) ||
					p.cnp.includes(args.search!),
			);
		}

		return patients;
	},
});

export const updatePatient = mutation({
	args: {
		patientId: v.id("patients"),
		name: v.optional(v.string()),
		surname: v.optional(v.string()),
		dateOfBirth: v.optional(v.number()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		cnp: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in to update patients.");
		}

		const { patientId, ...updateData } = args;

		// Verify the patient belongs to this doctor
		const patient = await ctx.db.get(patientId);
		if (!patient) {
			throw new Error("Patient not found.");
		}
		if (patient.doctorId !== userId) {
			throw new Error("You don't have permission to update this patient.");
		}

		if (updateData.cnp) {
			if (!/^\d{13}$/.test(updateData.cnp)) {
				throw new Error("Invalid CNP format. Must be 13 digits.");
			}
			// Check for duplicate CNP within this doctor's patients
			const existingPatient = await ctx.db
				.query("patients")
				.withIndex("doctorId", (q) => q.eq("doctorId", userId))
				.filter((q) => q.eq(q.field("cnp"), updateData.cnp as string))
				.first();

			if (existingPatient && existingPatient._id !== patientId) {
				throw new Error("A patient with this CNP already exists in your records.");
			}
		}

		for (const key in updateData) {
			if (updateData[key as keyof typeof updateData] === undefined) {
				delete updateData[key as keyof typeof updateData];
			}
		}

		await ctx.db.patch(patientId, updateData);

		return await ctx.db.get(patientId);
	},
});

export const deletePatient = mutation({
	args: { patientId: v.id("patients") },
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (!userId) {
			throw new Error("You must be logged in to delete patients.");
		}

		// Verify the patient belongs to this doctor
		const patient = await ctx.db.get(args.patientId);
		if (!patient) {
			throw new Error("Patient not found.");
		}
		if (patient.doctorId !== userId) {
			throw new Error("You don't have permission to delete this patient.");
		}

		// Also delete associated diagnosis documents
		const documents = await ctx.db
			.query("diagnosisDocuments")
			.withIndex("patientId", (q) => q.eq("patientId", args.patientId))
			.collect();

		for (const doc of documents) {
			if (doc.storageId) {
				await ctx.storage.delete(doc.storageId);
			}
			await ctx.db.delete(doc._id);
		}

		await ctx.db.delete(args.patientId);
		return { success: true };
	},
});
