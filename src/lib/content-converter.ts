import type { JSONContent } from "@tiptap/react";
import type { MedicalOutput } from "~/convex/schemas/medicalOutput";

/**
 * Converts MedicalOutput (structuredOutput) to TipTap JSON format
 * Creates a document structure matching the DOCX output format
 */
export function medicalOutputToTiptap(data: MedicalOutput, consultationDate?: string): JSONContent {
	const content: JSONContent[] = [];

	// Title
	content.push({
		type: "heading",
		attrs: { level: 1 },
		content: [{ type: "text", text: "FIȘA PACIENTULUI" }],
	});

	// Date
	const displayDate =
		data.metadata?.consultationDate || consultationDate || new Date().toLocaleDateString("ro-RO");
	content.push({
		type: "paragraph",
		content: [{ type: "text", text: `Data consultației: ${displayDate}` }],
	});

	// PATIENT INFO
	if (data.patientInfo) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "INFORMAȚII PACIENT" }],
		});

		if (data.patientInfo.name) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Nume: " },
					{ type: "text", text: data.patientInfo.name },
				],
			});
		}

		if (data.patientInfo.age !== undefined) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Vârsta: " },
					{ type: "text", text: `${data.patientInfo.age} ani` },
				],
			});
		}

		if (data.patientInfo.gender) {
			const genderDisplay =
				data.patientInfo.gender === "M"
					? "Masculin"
					: data.patientInfo.gender === "F"
						? "Feminin"
						: "Necunoscut";
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Sex: " },
					{ type: "text", text: genderDisplay },
				],
			});
		}
	}

	// DIAGNOSIS
	if (data.diagnosis) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "DIAGNOSTIC" }],
		});

		if (data.diagnosis.main) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Diagnostic principal: " },
					{ type: "text", text: data.diagnosis.main },
				],
			});
		}

		if (data.diagnosis.icd10Code) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Cod ICD-10: " },
					{ type: "text", text: data.diagnosis.icd10Code },
				],
			});
		}

		if (data.diagnosis.additional && data.diagnosis.additional.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Diagnostice secundare:" }],
			});
			content.push({
				type: "bulletList",
				content: data.diagnosis.additional.map((diag) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: diag }] }],
				})),
			});
		}
	}

	// COMPLAINTS
	if (data.complaints) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "ACUZE ȘI SIMPTOME" }],
		});

		if (data.complaints.chief) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Acuza principală: " },
					{ type: "text", text: data.complaints.chief },
				],
			});
		}

		if (data.complaints.duration) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Durată: " },
					{ type: "text", text: data.complaints.duration },
				],
			});
		}

		if (data.complaints.severity) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Severitate: " },
					{ type: "text", text: data.complaints.severity },
				],
			});
		}

		if (data.complaints.symptoms && data.complaints.symptoms.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Simptome:" }],
			});
			content.push({
				type: "bulletList",
				content: data.complaints.symptoms.map((symptom) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: symptom }] }],
				})),
			});
		}
	}

	// EXAMINATION
	if (data.examination) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "EXAMEN FIZIC" }],
		});

		if (data.examination.general) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Aspect general: " },
					{ type: "text", text: data.examination.general },
				],
			});
		}

		if (data.examination.vitalSigns) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Semne vitale:" }],
			});

			const vitalsList: string[] = [];
			if (data.examination.vitalSigns.bloodPressure) {
				vitalsList.push(`Tensiune arterială: ${data.examination.vitalSigns.bloodPressure}`);
			}
			if (data.examination.vitalSigns.heartRate) {
				vitalsList.push(`Frecvență cardiacă: ${data.examination.vitalSigns.heartRate} bpm`);
			}
			if (data.examination.vitalSigns.temperature) {
				vitalsList.push(`Temperatură: ${data.examination.vitalSigns.temperature}°C`);
			}
			if (data.examination.vitalSigns.respiratoryRate) {
				vitalsList.push(
					`Frecvență respiratorie: ${data.examination.vitalSigns.respiratoryRate}/min`,
				);
			}
			if (data.examination.vitalSigns.oxygenSaturation) {
				vitalsList.push(`Saturație oxigen: ${data.examination.vitalSigns.oxygenSaturation}%`);
			}

			if (vitalsList.length > 0) {
				content.push({
					type: "bulletList",
					content: vitalsList.map((vital) => ({
						type: "listItem",
						content: [{ type: "paragraph", content: [{ type: "text", text: vital }] }],
					})),
				});
			}
		}

		if (data.examination.systemicExamination) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Examen pe aparate/sisteme: " },
					{ type: "text", text: data.examination.systemicExamination },
				],
			});
		}
	}

	// INVESTIGATIONS
	if (data.investigations) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "INVESTIGAȚII" }],
		});

		if (data.investigations.laboratory && data.investigations.laboratory.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Analize de laborator:" }],
			});
			content.push({
				type: "bulletList",
				content: data.investigations.laboratory.map((lab) => {
					let labText = `${lab.test}: ${lab.result}`;
					if (lab.unit) labText += ` ${lab.unit}`;
					if (lab.normalRange) labText += ` (Normal: ${lab.normalRange})`;
					return {
						type: "listItem",
						content: [{ type: "paragraph", content: [{ type: "text", text: labText }] }],
					};
				}),
			});
		}

		if (data.investigations.imaging && data.investigations.imaging.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Investigații imagistice:" }],
			});
			content.push({
				type: "bulletList",
				content: data.investigations.imaging.map((img) => {
					const findings = Array.isArray(img.findings) ? img.findings.join(", ") : img.findings;
					const imgText = `${img.type}${img.date ? ` (${img.date})` : ""}: ${findings}`;
					return {
						type: "listItem",
						content: [{ type: "paragraph", content: [{ type: "text", text: imgText }] }],
					};
				}),
			});
		}

		if (data.investigations.other && data.investigations.other.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Alte investigații:" }],
			});
			content.push({
				type: "bulletList",
				content: data.investigations.other.map((other) => ({
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [{ type: "text", text: `${other.type}: ${other.findings}` }],
						},
					],
				})),
			});
		}
	}

	// HISTORY
	if (data.history) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "ANAMNEZA" }],
		});

		if (data.history.presentIllness) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Istoricul bolii actuale: " },
					{ type: "text", text: data.history.presentIllness },
				],
			});
		}

		if (data.history.pastMedical && data.history.pastMedical.length > 0) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Antecedente personale patologice:" },
				],
			});
			content.push({
				type: "bulletList",
				content: data.history.pastMedical.map((past) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: past }] }],
				})),
			});
		}

		if (data.history.familyHistory && data.history.familyHistory.length > 0) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Antecedente heredocolaterale:" },
				],
			});
			content.push({
				type: "bulletList",
				content: data.history.familyHistory.map((family) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: family }] }],
				})),
			});
		}

		if (data.history.allergies && data.history.allergies.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Alergii:" }],
			});
			content.push({
				type: "bulletList",
				content: data.history.allergies.map((allergy) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: allergy }] }],
				})),
			});
		}

		if (data.history.medications && data.history.medications.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Medicație curentă:" }],
			});
			content.push({
				type: "bulletList",
				content: data.history.medications.map((medication) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: medication }] }],
				})),
			});
		}
	}

	// TREATMENT
	if (data.treatment) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "TRATAMENT" }],
		});

		if (data.treatment.medications && data.treatment.medications.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Medicamente prescrise:" }],
			});
			content.push({
				type: "bulletList",
				content: data.treatment.medications.map((med) => {
					let medText = `${med.name} - ${med.dosage}, ${med.frequency}`;
					if (med.duration) medText += `, ${med.duration}`;
					if (med.route) medText += `, ${med.route}`;
					if (med.instructions) medText += ` (${med.instructions})`;
					return {
						type: "listItem",
						content: [{ type: "paragraph", content: [{ type: "text", text: medText }] }],
					};
				}),
			});
		}

		if (data.treatment.procedures && data.treatment.procedures.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Proceduri:" }],
			});
			content.push({
				type: "bulletList",
				content: data.treatment.procedures.map((proc) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: proc }] }],
				})),
			});
		}

		if (data.treatment.nonPharmacological && data.treatment.nonPharmacological.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Tratament non-medicamentos:" }],
			});
			content.push({
				type: "bulletList",
				content: data.treatment.nonPharmacological.map((nonPharm) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: nonPharm }] }],
				})),
			});
		}
	}

	// RECOMMENDATIONS
	if (data.recommendations) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "RECOMANDĂRI" }],
		});

		if (data.recommendations.lifestyle && data.recommendations.lifestyle.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Stil de viață:" }],
			});
			content.push({
				type: "bulletList",
				content: data.recommendations.lifestyle.map((lifestyle) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: lifestyle }] }],
				})),
			});
		}

		if (data.recommendations.diet && data.recommendations.diet.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Dietă:" }],
			});
			content.push({
				type: "bulletList",
				content: data.recommendations.diet.map((diet) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: diet }] }],
				})),
			});
		}

		if (data.recommendations.additionalTests && data.recommendations.additionalTests.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Investigații suplimentare:" }],
			});
			content.push({
				type: "bulletList",
				content: data.recommendations.additionalTests.map((test) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: test }] }],
				})),
			});
		}

		if (data.recommendations.followUp) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Control:" }],
			});
			const followUpItems: string[] = [];
			if (data.recommendations.followUp.date) {
				followUpItems.push(`Data: ${data.recommendations.followUp.date}`);
			}
			if (data.recommendations.followUp.reason) {
				followUpItems.push(`Motiv: ${data.recommendations.followUp.reason}`);
			}
			if (data.recommendations.followUp.specialist) {
				followUpItems.push(`Specialist: ${data.recommendations.followUp.specialist}`);
			}
			if (followUpItems.length > 0) {
				content.push({
					type: "bulletList",
					content: followUpItems.map((item) => ({
						type: "listItem",
						content: [{ type: "paragraph", content: [{ type: "text", text: item }] }],
					})),
				});
			}
		}

		if (data.recommendations.warnings && data.recommendations.warnings.length > 0) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Avertismente:" }],
			});
			content.push({
				type: "bulletList",
				content: data.recommendations.warnings.map((warning) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: warning }] }],
				})),
			});
		}
	}

	// CLINICAL NOTES
	if (data.clinicalNotes) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "NOTE CLINICE" }],
		});

		if (data.clinicalNotes.conclusion) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Concluzie: " },
					{ type: "text", text: data.clinicalNotes.conclusion },
				],
			});
		}

		if (
			data.clinicalNotes.differentialDiagnosis &&
			data.clinicalNotes.differentialDiagnosis.length > 0
		) {
			content.push({
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "bold" }], text: "Diagnostice diferențiale:" }],
			});
			content.push({
				type: "bulletList",
				content: data.clinicalNotes.differentialDiagnosis.map((diff) => ({
					type: "listItem",
					content: [{ type: "paragraph", content: [{ type: "text", text: diff }] }],
				})),
			});
		}

		if (data.clinicalNotes.additionalNotes) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Note adiționale: " },
					{ type: "text", text: data.clinicalNotes.additionalNotes },
				],
			});
		}
	}

	// METADATA
	if (data.metadata) {
		content.push({
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "INFORMAȚII ADMINISTRATIVE" }],
		});

		if (data.metadata.consultationType) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Tip consultație: " },
					{ type: "text", text: data.metadata.consultationType },
				],
			});
		}

		if (data.metadata.specialization) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Specialitate: " },
					{ type: "text", text: data.metadata.specialization },
				],
			});
		}

		if (data.metadata.doctorName) {
			content.push({
				type: "paragraph",
				content: [
					{ type: "text", marks: [{ type: "bold" }], text: "Medic examinator: " },
					{ type: "text", text: data.metadata.doctorName },
				],
			});
		}
	}

	return {
		type: "doc",
		content,
	};
}

/**
 * Helper to extract text from TipTap content nodes
 */
function extractText(content: JSONContent[] | undefined): string {
	if (!content) return "";
	return content
		.map((node) => {
			if (node.type === "text") return node.text || "";
			if (node.content) return extractText(node.content);
			return "";
		})
		.join("");
}

/**
 * Helper to extract list items as string array
 */
function extractListItems(content: JSONContent[] | undefined): string[] {
	if (!content) return [];
	const items: string[] = [];
	for (const node of content) {
		if (node.type === "bulletList" || node.type === "orderedList") {
			if (node.content) {
				for (const listItem of node.content) {
					if (listItem.type === "listItem") {
						items.push(extractText(listItem.content));
					}
				}
			}
		}
	}
	return items;
}

/**
 * Converts TipTap JSON back to MedicalOutput format
 * This is a simplified parser that extracts content based on section headings
 */
export function tiptapToMedicalOutput(doc: JSONContent): MedicalOutput {
	const result: MedicalOutput = {};
	const content = doc.content || [];

	let currentSection = "";
	let sectionContent: JSONContent[] = [];

	// Helper to process accumulated section content
	const processSection = () => {
		if (!currentSection || sectionContent.length === 0) return;

		switch (currentSection) {
			case "INFORMAȚII PACIENT":
				result.patientInfo = parsePatientInfo(sectionContent);
				break;
			case "DIAGNOSTIC":
				result.diagnosis = parseDiagnosis(sectionContent);
				break;
			case "ACUZE ȘI SIMPTOME":
				result.complaints = parseComplaints(sectionContent);
				break;
			case "EXAMEN FIZIC":
				result.examination = parseExamination(sectionContent);
				break;
			case "INVESTIGAȚII":
				result.investigations = parseInvestigations(sectionContent);
				break;
			case "ANAMNEZA":
				result.history = parseHistory(sectionContent);
				break;
			case "TRATAMENT":
				result.treatment = parseTreatment(sectionContent);
				break;
			case "RECOMANDĂRI":
				result.recommendations = parseRecommendations(sectionContent);
				break;
			case "NOTE CLINICE":
				result.clinicalNotes = parseClinicalNotes(sectionContent);
				break;
			case "INFORMAȚII ADMINISTRATIVE":
				result.metadata = parseMetadata(sectionContent);
				break;
		}
	};

	// Parse content by sections
	for (const node of content) {
		if (node.type === "heading" && node.attrs?.level === 2) {
			// Process previous section
			processSection();
			// Start new section
			currentSection = extractText(node.content);
			sectionContent = [];
		} else if (node.type === "heading" && node.attrs?.level === 1) {
			// Skip title
			continue;
		} else if (currentSection) {
			sectionContent.push(node);
		} else {
			// Content before first section (like date)
			const text = extractText(node.content);
			if (text.startsWith("Data consultației:")) {
				if (!result.metadata) result.metadata = {};
				result.metadata.consultationDate = text.replace("Data consultației:", "").trim();
			}
		}
	}

	// Process last section
	processSection();

	return result;
}

// Helper parsing functions for each section
function parsePatientInfo(content: JSONContent[]): MedicalOutput["patientInfo"] {
	const info: NonNullable<MedicalOutput["patientInfo"]> = {};

	for (const node of content) {
		const text = extractText(node.content);
		if (text.startsWith("Nume:")) {
			info.name = text.replace("Nume:", "").trim();
		} else if (text.startsWith("Vârsta:")) {
			const ageMatch = text.match(/(\d+)/);
			if (ageMatch) info.age = parseInt(ageMatch[1], 10);
		} else if (text.startsWith("Sex:")) {
			const gender = text.replace("Sex:", "").trim();
			if (gender === "Masculin") info.gender = "M";
			else if (gender === "Feminin") info.gender = "F";
			else info.gender = "Necunoscut";
		}
	}

	return Object.keys(info).length > 0 ? info : undefined;
}

function parseDiagnosis(content: JSONContent[]): MedicalOutput["diagnosis"] {
	const diagnosis: NonNullable<MedicalOutput["diagnosis"]> = { main: "" };

	for (const node of content) {
		const text = extractText(node.content);
		if (text.startsWith("Diagnostic principal:")) {
			diagnosis.main = text.replace("Diagnostic principal:", "").trim();
		} else if (text.startsWith("Cod ICD-10:")) {
			diagnosis.icd10Code = text.replace("Cod ICD-10:", "").trim();
		} else if (text.includes("Diagnostice secundare")) {
			// Next node should be bullet list
			const idx = content.indexOf(node);
			if (idx < content.length - 1) {
				diagnosis.additional = extractListItems([content[idx + 1]]);
			}
		}
	}

	return diagnosis.main ? diagnosis : undefined;
}

function parseComplaints(content: JSONContent[]): MedicalOutput["complaints"] {
	const complaints: NonNullable<MedicalOutput["complaints"]> = {};

	for (let i = 0; i < content.length; i++) {
		const node = content[i];
		const text = extractText(node.content);
		if (text.startsWith("Acuza principală:")) {
			complaints.chief = text.replace("Acuza principală:", "").trim();
		} else if (text.startsWith("Durată:")) {
			complaints.duration = text.replace("Durată:", "").trim();
		} else if (text.startsWith("Severitate:")) {
			const severity = text.replace("Severitate:", "").trim();
			if (["ușoară", "moderată", "severă", "critică"].includes(severity)) {
				complaints.severity = severity as "ușoară" | "moderată" | "severă" | "critică";
			}
		} else if (text.includes("Simptome")) {
			if (i < content.length - 1) {
				complaints.symptoms = extractListItems([content[i + 1]]);
			}
		}
	}

	return Object.keys(complaints).length > 0 ? complaints : undefined;
}

function parseExamination(content: JSONContent[]): MedicalOutput["examination"] {
	const examination: NonNullable<MedicalOutput["examination"]> = {};

	for (let i = 0; i < content.length; i++) {
		const node = content[i];
		const text = extractText(node.content);
		if (text.startsWith("Aspect general:")) {
			examination.general = text.replace("Aspect general:", "").trim();
		} else if (text.includes("Semne vitale")) {
			if (i < content.length - 1) {
				const vitals = extractListItems([content[i + 1]]);
				examination.vitalSigns = {};
				for (const vital of vitals) {
					if (vital.includes("Tensiune arterială:")) {
						examination.vitalSigns.bloodPressure = vital.split(":")[1]?.trim();
					} else if (vital.includes("Frecvență cardiacă:")) {
						const match = vital.match(/(\d+)/);
						if (match) examination.vitalSigns.heartRate = parseInt(match[1], 10);
					} else if (vital.includes("Temperatură:")) {
						const match = vital.match(/([\d.]+)/);
						if (match) examination.vitalSigns.temperature = parseFloat(match[1]);
					} else if (vital.includes("Frecvență respiratorie:")) {
						const match = vital.match(/(\d+)/);
						if (match) examination.vitalSigns.respiratoryRate = parseInt(match[1], 10);
					} else if (vital.includes("Saturație oxigen:")) {
						const match = vital.match(/(\d+)/);
						if (match) examination.vitalSigns.oxygenSaturation = parseInt(match[1], 10);
					}
				}
			}
		} else if (text.startsWith("Examen pe aparate/sisteme:")) {
			examination.systemicExamination = text.replace("Examen pe aparate/sisteme:", "").trim();
		}
	}

	return Object.keys(examination).length > 0 ? examination : undefined;
}

function parseInvestigations(content: JSONContent[]): MedicalOutput["investigations"] {
	const investigations: NonNullable<MedicalOutput["investigations"]> = {};

	for (let i = 0; i < content.length; i++) {
		const node = content[i];
		const text = extractText(node.content);
		if (text.includes("Analize de laborator")) {
			if (i < content.length - 1) {
				const items = extractListItems([content[i + 1]]);
				investigations.laboratory = items.map((item) => {
					const parts = item.split(":");
					return {
						test: parts[0]?.trim() || "",
						result: parts[1]?.trim() || "",
					};
				});
			}
		} else if (text.includes("Investigații imagistice")) {
			if (i < content.length - 1) {
				const items = extractListItems([content[i + 1]]);
				investigations.imaging = items.map((item) => {
					const colonIdx = item.indexOf(":");
					return {
						type: item.substring(0, colonIdx).trim(),
						findings: item.substring(colonIdx + 1).trim(),
					};
				});
			}
		} else if (text.includes("Alte investigații")) {
			if (i < content.length - 1) {
				const items = extractListItems([content[i + 1]]);
				investigations.other = items.map((item) => {
					const colonIdx = item.indexOf(":");
					return {
						type: item.substring(0, colonIdx).trim(),
						findings: item.substring(colonIdx + 1).trim(),
					};
				});
			}
		}
	}

	return Object.keys(investigations).length > 0 ? investigations : undefined;
}

function parseHistory(content: JSONContent[]): MedicalOutput["history"] {
	const history: NonNullable<MedicalOutput["history"]> = {};

	for (let i = 0; i < content.length; i++) {
		const node = content[i];
		const text = extractText(node.content);
		if (text.startsWith("Istoricul bolii actuale:")) {
			history.presentIllness = text.replace("Istoricul bolii actuale:", "").trim();
		} else if (text.includes("Antecedente personale patologice")) {
			if (i < content.length - 1) {
				history.pastMedical = extractListItems([content[i + 1]]);
			}
		} else if (text.includes("Antecedente heredocolaterale")) {
			if (i < content.length - 1) {
				history.familyHistory = extractListItems([content[i + 1]]);
			}
		} else if (text.includes("Alergii")) {
			if (i < content.length - 1) {
				history.allergies = extractListItems([content[i + 1]]);
			}
		} else if (text.includes("Medicație curentă")) {
			if (i < content.length - 1) {
				history.medications = extractListItems([content[i + 1]]);
			}
		}
	}

	return Object.keys(history).length > 0 ? history : undefined;
}

function parseTreatment(content: JSONContent[]): MedicalOutput["treatment"] {
	const treatment: NonNullable<MedicalOutput["treatment"]> = {};

	for (let i = 0; i < content.length; i++) {
		const node = content[i];
		const text = extractText(node.content);
		if (text.includes("Medicamente prescrise")) {
			if (i < content.length - 1) {
				const items = extractListItems([content[i + 1]]);
				treatment.medications = items.map((item) => {
					// Parse: "Name - dosage, frequency, duration, route (instructions)"
					const parts = item.split(" - ");
					const name = parts[0]?.trim() || "";
					const rest = parts[1] || "";
					const restParts = rest.split(",").map((p) => p.trim());
					return {
						name,
						dosage: restParts[0] || "",
						frequency: restParts[1] || "",
						duration: restParts[2],
						route: restParts[3],
					};
				});
			}
		} else if (text.includes("Proceduri")) {
			if (i < content.length - 1) {
				treatment.procedures = extractListItems([content[i + 1]]);
			}
		} else if (text.includes("Tratament non-medicamentos")) {
			if (i < content.length - 1) {
				treatment.nonPharmacological = extractListItems([content[i + 1]]);
			}
		}
	}

	return Object.keys(treatment).length > 0 ? treatment : undefined;
}

function parseRecommendations(content: JSONContent[]): MedicalOutput["recommendations"] {
	const recommendations: NonNullable<MedicalOutput["recommendations"]> = {};

	for (let i = 0; i < content.length; i++) {
		const node = content[i];
		const text = extractText(node.content);
		if (text.includes("Stil de viață")) {
			if (i < content.length - 1) {
				recommendations.lifestyle = extractListItems([content[i + 1]]);
			}
		} else if (text.includes("Dietă")) {
			if (i < content.length - 1) {
				recommendations.diet = extractListItems([content[i + 1]]);
			}
		} else if (text.includes("Investigații suplimentare")) {
			if (i < content.length - 1) {
				recommendations.additionalTests = extractListItems([content[i + 1]]);
			}
		} else if (text.includes("Control")) {
			if (i < content.length - 1) {
				const items = extractListItems([content[i + 1]]);
				recommendations.followUp = {};
				for (const item of items) {
					if (item.startsWith("Data:")) {
						recommendations.followUp.date = item.replace("Data:", "").trim();
					} else if (item.startsWith("Motiv:")) {
						recommendations.followUp.reason = item.replace("Motiv:", "").trim();
					} else if (item.startsWith("Specialist:")) {
						recommendations.followUp.specialist = item.replace("Specialist:", "").trim();
					}
				}
			}
		} else if (text.includes("Avertismente")) {
			if (i < content.length - 1) {
				recommendations.warnings = extractListItems([content[i + 1]]);
			}
		}
	}

	return Object.keys(recommendations).length > 0 ? recommendations : undefined;
}

function parseClinicalNotes(content: JSONContent[]): MedicalOutput["clinicalNotes"] {
	const notes: NonNullable<MedicalOutput["clinicalNotes"]> = {};

	for (let i = 0; i < content.length; i++) {
		const node = content[i];
		const text = extractText(node.content);
		if (text.startsWith("Concluzie:")) {
			notes.conclusion = text.replace("Concluzie:", "").trim();
		} else if (text.includes("Diagnostice diferențiale")) {
			if (i < content.length - 1) {
				notes.differentialDiagnosis = extractListItems([content[i + 1]]);
			}
		} else if (text.startsWith("Note adiționale:")) {
			notes.additionalNotes = text.replace("Note adiționale:", "").trim();
		}
	}

	return Object.keys(notes).length > 0 ? notes : undefined;
}

function parseMetadata(content: JSONContent[]): MedicalOutput["metadata"] {
	const metadata: NonNullable<MedicalOutput["metadata"]> = {};

	for (const node of content) {
		const text = extractText(node.content);
		if (text.startsWith("Tip consultație:")) {
			const type = text.replace("Tip consultație:", "").trim();
			if (["primă consultație", "control", "urgență", "teleconsultație"].includes(type)) {
				metadata.consultationType = type as
					| "primă consultație"
					| "control"
					| "urgență"
					| "teleconsultație";
			}
		} else if (text.startsWith("Specialitate:")) {
			metadata.specialization = text.replace("Specialitate:", "").trim();
		} else if (text.startsWith("Medic examinator:")) {
			metadata.doctorName = text.replace("Medic examinator:", "").trim();
		}
	}

	return Object.keys(metadata).length > 0 ? metadata : undefined;
}
