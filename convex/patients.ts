import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    // Validate CNP format (13 digits)
    if (!/^\d{13}$/.test(args.cnp)) {
      throw new Error("Invalid CNP format. Must be 13 digits.");
    }

    // Check for duplicate CNP
    const existingPatient = await ctx.db
      .query("patients")
      .withIndex("cnp", (q) => q.eq("cnp", args.cnp))
      .first();

    if (existingPatient) {
      throw new Error("A patient with this CNP already exists.");
    }

    const patientId = await ctx.db.insert("patients", {
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
    const patient = await ctx.db.get(args.patientId);
    return patient;
  },
});

export const listPatients = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.search) {
      // This is a simplified search. A full-text search index would be more robust.
      const patients = await ctx.db.query("patients").collect();
      return patients.filter(
        (p) =>
          p.name.toLowerCase().includes(args.search!.toLowerCase()) ||
          p.surname.toLowerCase().includes(args.search!.toLowerCase()) ||
          p.cnp.includes(args.search!)
      );
    }
    // Returning patients sorted by creation time (implicit in Convex IDs)
    return await ctx.db.query("patients").order("desc").collect();
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
    const { patientId, ...updateData } = args;

    if (updateData.cnp) {
      if (!/^\d{13}$/.test(updateData.cnp)) {
        throw new Error("Invalid CNP format. Must be 13 digits.");
      }
      const existingPatient = await ctx.db
        .query("patients")
        .withIndex("cnp", (q) => q.eq("cnp", updateData.cnp as string))
        .first();

      if (existingPatient && existingPatient._id !== patientId) {
        throw new Error("A patient with this CNP already exists.");
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
