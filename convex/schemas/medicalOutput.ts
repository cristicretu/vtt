import { v } from "convex/values";
import { z } from "zod";

export const medicalOutputSchema = z.object({
	// Patient basic information
	patientInfo: z
		.object({
			name: z.string().optional(),
			age: z.number().optional(),
			gender: z.enum(["M", "F", "Necunoscut"]).optional(),
		})
		.optional(),

	// Main diagnosis section
	diagnosis: z
		.object({
			main: z.string().describe("Diagnosticul principal"),
			additional: z.array(z.string()).optional().describe("Diagnostice secundare"),
			icd10Code: z.string().optional().describe("Cod ICD-10"),
		})
		.nullish(),

	// Patient complaints and symptoms
	complaints: z
		.object({
			chief: z.string().optional().describe("Plângerea principală"),
			symptoms: z.array(z.string()).optional().describe("Lista de simptome"),
			duration: z.string().optional().describe("Durata simptomelor"),
			severity: z.enum(["ușoară", "moderată", "severă", "critică"]).optional(),
		})
		.nullish(),

	// Physical examination findings
	examination: z
		.object({
			general: z.string().optional().describe("Aspectul general al pacientului"),
			vitalSigns: z
				.object({
					bloodPressure: z.string().optional().describe("Tensiunea arterială (ex: 120/80 mmHg)"),
					heartRate: z.number().optional().describe("Frecvența cardiacă (bpm)"),
					temperature: z.number().optional().describe("Temperatura (°C)"),
					respiratoryRate: z.number().optional().describe("Frecvența respiratorie"),
					oxygenSaturation: z.number().optional().describe("Saturația de oxigen (%)"),
				})
				.optional(),
			systemicExamination: z
				.string()
				.optional()
				.describe("Examen pe aparate/sisteme - detalii despre examinarea fizică"),
		})
		.nullish(),

	// Investigations and test results
	investigations: z
		.object({
			laboratory: z
				.array(
					z.object({
						test: z.string(),
						result: z.string(),
						unit: z.string().optional(),
						normalRange: z.string().optional(),
					}),
				)
				.optional()
				.describe("Analize de laborator"),

			imaging: z
				.array(
					z.object({
						type: z.string().describe("Tipul investigației (ex: ecografie, radiografie)"),
						findings: z.union([z.string(), z.array(z.string())]).describe("Rezultatele"),
						date: z.string().optional(),
					}),
				)
				.optional()
				.describe("Investigații imagistice"),

			other: z
				.array(
					z.object({
						type: z.string(),
						findings: z.string(),
					}),
				)
				.optional()
				.describe("Alte investigații"),
		})
		.optional(),

	// Medical history
	history: z
		.object({
			presentIllness: z.string().optional().describe("Istoricul bolii actuale"),
			pastMedical: z.array(z.string()).optional().describe("Antecedente personale patologice"),
			familyHistory: z.array(z.string()).optional().describe("Antecedente heredocolaterale"),
			allergies: z.array(z.string()).optional().describe("Alergii"),
			medications: z.array(z.string()).optional().describe("Medicație curentă"),
		})
		.nullish(),

	// Treatment and medications
	treatment: z
		.object({
			medications: z
				.array(
					z.object({
						name: z.string().describe("Numele medicamentului"),
						dosage: z.string().describe("Dozajul (ex: 500mg)"),
						frequency: z.string().describe("Frecvența (ex: 2x/zi)"),
						duration: z.string().optional().describe("Durata (ex: 7 zile)"),
						route: z.string().optional().describe("Calea de administrare"),
						instructions: z.string().optional().describe("Instrucțiuni speciale"),
					}),
				)
				.optional()
				.describe("Medicamente prescrise"),

			procedures: z.array(z.string()).optional().describe("Proceduri efectuate sau recomandate"),

			nonPharmacological: z
				.array(z.string())
				.optional()
				.describe("Tratament non-medicamentos (ex: fizioterapie)"),
		})
		.nullish(),

	// Recommendations and follow-up
	recommendations: z
		.object({
			lifestyle: z.array(z.string()).optional().describe("Recomandări stil de viață"),
			diet: z.array(z.string()).optional().describe("Recomandări dietetice"),
			followUp: z
				.object({
					date: z.string().optional().describe("Data următoarei consultatii"),
					reason: z.string().optional().describe("Motivul controlului"),
					specialist: z.string().optional().describe("Specialist recomandat"),
				})
				.optional(),
			additionalTests: z
				.array(z.string())
				.optional()
				.describe("Investigații suplimentare recomandate"),
			warnings: z.array(z.string()).optional().describe("Avertismente importante"),
		})
		.nullish(),

	// Clinical notes
	clinicalNotes: z
		.object({
			conclusion: z.string().optional().describe("Concluziile medicului"),
			additionalNotes: z.string().optional().describe("Note adiționale"),
			differentialDiagnosis: z.array(z.string()).optional().describe("Diagnostice diferențiale"),
		})
		.optional(),

	// Administrative
	metadata: z
		.object({
			consultationDate: z.string().nullish().describe("Data consultației"),
			consultationType: z
				.enum(["primă consultație", "control", "urgență", "teleconsultație"])
				.nullish(),
			specialization: z.string().optional().describe("Specialitatea medicală"),
			doctorName: z.string().nullish().describe("Numele medicului"),
		})
		.optional(),
});

export type MedicalOutput = z.infer<typeof medicalOutputSchema>;

/**
 * Convex validator version for database storage
 * Mirrors the Zod schema structure
 */
export const medicalOutputValidator = v.object({
	patientInfo: v.optional(
		v.object({
			name: v.optional(v.string()),
			age: v.optional(v.number()),
			gender: v.optional(v.string()),
		}),
	),

	diagnosis: v.optional(
		v.object({
			main: v.string(),
			additional: v.optional(v.array(v.string())),
			icd10Code: v.optional(v.string()),
		}),
	),

	complaints: v.optional(
		v.object({
			chief: v.optional(v.string()),
			symptoms: v.optional(v.array(v.string())),
			duration: v.optional(v.string()),
			severity: v.optional(v.string()),
		}),
	),

	examination: v.optional(
		v.object({
			general: v.optional(v.string()),
			vitalSigns: v.optional(
				v.object({
					bloodPressure: v.optional(v.string()),
					heartRate: v.optional(v.number()),
					temperature: v.optional(v.number()),
					respiratoryRate: v.optional(v.number()),
					oxygenSaturation: v.optional(v.number()),
				}),
			),
			systemicExamination: v.optional(v.string()),
		}),
	),

	investigations: v.optional(
		v.object({
			laboratory: v.optional(
				v.array(
					v.object({
						test: v.string(),
						result: v.string(),
						unit: v.optional(v.string()),
						normalRange: v.optional(v.string()),
					}),
				),
			),
			imaging: v.optional(
				v.array(
					v.object({
						type: v.string(),
						findings: v.union(v.string(), v.array(v.string())),
						date: v.optional(v.string()),
					}),
				),
			),
			other: v.optional(
				v.array(
					v.object({
						type: v.string(),
						findings: v.string(),
					}),
				),
			),
		}),
	),

	history: v.optional(
		v.object({
			presentIllness: v.optional(v.string()),
			pastMedical: v.optional(v.array(v.string())),
			familyHistory: v.optional(v.array(v.string())),
			allergies: v.optional(v.array(v.string())),
			medications: v.optional(v.array(v.string())),
		}),
	),

	treatment: v.optional(
		v.object({
			medications: v.optional(
				v.array(
					v.object({
						name: v.string(),
						dosage: v.string(),
						frequency: v.string(),
						duration: v.optional(v.string()),
						route: v.optional(v.string()),
						instructions: v.optional(v.string()),
					}),
				),
			),
			procedures: v.optional(v.array(v.string())),
			nonPharmacological: v.optional(v.array(v.string())),
		}),
	),

	recommendations: v.optional(
		v.object({
			lifestyle: v.optional(v.array(v.string())),
			diet: v.optional(v.array(v.string())),
			followUp: v.optional(
				v.object({
					date: v.optional(v.string()),
					reason: v.optional(v.string()),
					specialist: v.optional(v.string()),
				}),
			),
			additionalTests: v.optional(v.array(v.string())),
			warnings: v.optional(v.array(v.string())),
		}),
	),

	clinicalNotes: v.optional(
		v.object({
			conclusion: v.optional(v.string()),
			additionalNotes: v.optional(v.string()),
			differentialDiagnosis: v.optional(v.array(v.string())),
		}),
	),

	metadata: v.optional(
		v.object({
			consultationDate: v.optional(v.string()),
			consultationType: v.optional(v.string()),
			specialization: v.optional(v.string()),
			doctorName: v.optional(v.string()),
		}),
	),
});
