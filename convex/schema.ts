import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  // Use authTables for user sessions and accounts
  ...authTables,

  // The 'users' table will represent Doctors and work with the auth system.
  users: defineTable({
    name: v.string(), // Doctor's first name
    surname: v.string(),
    email: v.string(),
    clinic: v.string(),
    specialisation: v.string(),
  }).index("email", ["email"]),

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
    transcript: v.string(),
    structuredOutput: v.any(), // To store JSON from the LLM
    dateCreated: v.number(), // Unix timestamp for creation date
    dateLastModified: v.number(), // Unix timestamp for last modification date
  })
    .index("doctorId", ["doctorId"])
    .index("patientId", ["patientId"]),
});

export default schema;
