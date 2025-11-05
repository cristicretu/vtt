import {
	Document,
	Paragraph,
	TextRun,
	HeadingLevel,
	AlignmentType,
	Packer,
} from "docx";
import { saveAs } from "file-saver";
import type { MedicalOutput } from "~/convex/schemas/medicalOutput";

/**
 * Generates a formatted Romanian medical document (Fișa Pacientului) from structured medical data
 * @param data The structured medical output data
 * @param patientFullName Full name of the patient for the filename
 * @param consultationDate Date of the consultation for the filename
 * @returns void - triggers browser download
 */
export async function generateMedicalDocx(
	data: MedicalOutput,
	patientFullName: string,
	consultationDate: string,
): Promise<void> {
	const sections: Paragraph[] = [];

	// Helper function to create a heading
	const createHeading = (text: string, level: HeadingLevel = HeadingLevel.HEADING_2): Paragraph => {
		return new Paragraph({
			text: text,
			heading: level,
			spacing: { before: 240, after: 120 },
		});
	};

	// Helper function to create a normal paragraph
	const createParagraph = (text: string, bold = false): Paragraph => {
		return new Paragraph({
			children: [
				new TextRun({
					text: text,
					bold: bold,
				}),
			],
			spacing: { after: 120 },
		});
	};

	// Helper function to create a bullet list item
	const createBullet = (text: string): Paragraph => {
		return new Paragraph({
			text: text,
			bullet: {
				level: 0,
			},
			spacing: { after: 60 },
		});
	};

	// Title
	sections.push(
		new Paragraph({
			text: "FIȘA PACIENTULUI",
			heading: HeadingLevel.HEADING_1,
			alignment: AlignmentType.CENTER,
			spacing: { after: 240 },
		}),
	);

	// Date
	const displayDate = data.metadata?.consultationDate || consultationDate;
	sections.push(
		new Paragraph({
			text: `Data consultației: ${displayDate}`,
			alignment: AlignmentType.RIGHT,
			spacing: { after: 240 },
		}),
	);

	// PATIENT INFO
	if (data.patientInfo) {
		sections.push(createHeading("INFORMAȚII PACIENT", HeadingLevel.HEADING_2));

		if (data.patientInfo.name) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Nume: ", bold: true }),
						new TextRun({ text: data.patientInfo.name }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.patientInfo.age !== undefined) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Vârsta: ", bold: true }),
						new TextRun({ text: `${data.patientInfo.age} ani` }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.patientInfo.gender) {
			const genderDisplay =
				data.patientInfo.gender === "M" ? "Masculin" : data.patientInfo.gender === "F" ? "Feminin" : "Necunoscut";
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Sex: ", bold: true }),
						new TextRun({ text: genderDisplay }),
					],
					spacing: { after: 240 },
				}),
			);
		}
	}

	// DIAGNOSIS
	sections.push(createHeading("DIAGNOSTIC"));

	if (data.diagnosis.main) {
		sections.push(
			new Paragraph({
				children: [
					new TextRun({ text: "Diagnostic principal: ", bold: true }),
					new TextRun({ text: data.diagnosis.main }),
				],
				spacing: { after: 120 },
			}),
		);
	}

	if (data.diagnosis.icd10Code) {
		sections.push(
			new Paragraph({
				children: [
					new TextRun({ text: "Cod ICD-10: ", bold: true }),
					new TextRun({ text: data.diagnosis.icd10Code }),
				],
				spacing: { after: 120 },
			}),
		);
	}

	if (data.diagnosis.additional && data.diagnosis.additional.length > 0) {
		sections.push(createParagraph("Diagnostice secundare:", true));
		for (const diag of data.diagnosis.additional) {
			sections.push(createBullet(diag));
		}
	}

	// COMPLAINTS
	if (data.complaints) {
		sections.push(createHeading("ACUZE ȘI SIMPTOME"));

		if (data.complaints.chief) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Acuza principală: ", bold: true }),
						new TextRun({ text: data.complaints.chief }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.complaints.duration) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Durată: ", bold: true }),
						new TextRun({ text: data.complaints.duration }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.complaints.severity) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Severitate: ", bold: true }),
						new TextRun({ text: data.complaints.severity }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.complaints.symptoms && data.complaints.symptoms.length > 0) {
			sections.push(createParagraph("Simptome:", true));
			for (const symptom of data.complaints.symptoms) {
				sections.push(createBullet(symptom));
			}
		}
	}

	// EXAMINATION
	if (data.examination) {
		sections.push(createHeading("EXAMEN FIZIC"));

		if (data.examination.general) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Aspect general: ", bold: true }),
						new TextRun({ text: data.examination.general }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		// Vital Signs
		if (data.examination.vitalSigns) {
			sections.push(createParagraph("Semne vitale:", true));

			if (data.examination.vitalSigns.bloodPressure) {
				sections.push(createBullet(`Tensiune arterială: ${data.examination.vitalSigns.bloodPressure}`));
			}
			if (data.examination.vitalSigns.heartRate) {
				sections.push(createBullet(`Frecvență cardiacă: ${data.examination.vitalSigns.heartRate} bpm`));
			}
			if (data.examination.vitalSigns.temperature) {
				sections.push(createBullet(`Temperatură: ${data.examination.vitalSigns.temperature}°C`));
			}
			if (data.examination.vitalSigns.respiratoryRate) {
				sections.push(createBullet(`Frecvență respiratorie: ${data.examination.vitalSigns.respiratoryRate}/min`));
			}
			if (data.examination.vitalSigns.oxygenSaturation) {
				sections.push(createBullet(`Saturație oxigen: ${data.examination.vitalSigns.oxygenSaturation}%`));
			}
		}

		// Systemic Examination
		if (data.examination.systemicExamination) {
			sections.push(createParagraph("Examen pe aparate/sisteme:", true));
			for (const [system, findings] of Object.entries(data.examination.systemicExamination)) {
				sections.push(createBullet(`${system}: ${findings}`));
			}
		}
	}

	// INVESTIGATIONS
	if (data.investigations) {
		sections.push(createHeading("INVESTIGAȚII"));

		// Laboratory
		if (data.investigations.laboratory && data.investigations.laboratory.length > 0) {
			sections.push(createParagraph("Analize de laborator:", true));
			for (const lab of data.investigations.laboratory) {
				let labText = lab.test + ": " + lab.result;
				if (lab.unit) labText += " " + lab.unit;
				if (lab.normalRange) labText += " (Normal: " + lab.normalRange + ")";
				sections.push(createBullet(labText));
			}
		}

		// Imaging
		if (data.investigations.imaging && data.investigations.imaging.length > 0) {
			sections.push(createParagraph("Investigații imagistice:", true));
			for (const img of data.investigations.imaging) {
				const imgText = `${img.type}${img.date ? " (" + img.date + ")" : ""}: ${img.findings}`;
				sections.push(createBullet(imgText));
			}
		}

		// Other Investigations
		if (data.investigations.other && data.investigations.other.length > 0) {
			sections.push(createParagraph("Alte investigații:", true));
			for (const other of data.investigations.other) {
				sections.push(createBullet(`${other.type}: ${other.findings}`));
			}
		}
	}

	// MEDICAL HISTORY
	if (data.history) {
		sections.push(createHeading("ANAMNEZA"));

		if (data.history.presentIllness) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Istoricul bolii actuale: ", bold: true }),
						new TextRun({ text: data.history.presentIllness }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.history.pastMedical && data.history.pastMedical.length > 0) {
			sections.push(createParagraph("Antecedente personale patologice:", true));
			for (const past of data.history.pastMedical) {
				sections.push(createBullet(past));
			}
		}

		if (data.history.familyHistory && data.history.familyHistory.length > 0) {
			sections.push(createParagraph("Antecedente heredocolaterale:", true));
			for (const family of data.history.familyHistory) {
				sections.push(createBullet(family));
			}
		}

		if (data.history.allergies && data.history.allergies.length > 0) {
			sections.push(createParagraph("Alergii:", true));
			for (const allergy of data.history.allergies) {
				sections.push(createBullet(allergy));
			}
		}

		if (data.history.medications && data.history.medications.length > 0) {
			sections.push(createParagraph("Medicație curentă:", true));
			for (const medication of data.history.medications) {
				sections.push(createBullet(medication));
			}
		}
	}

	// TREATMENT
	if (data.treatment) {
		sections.push(createHeading("TRATAMENT"));

		if (data.treatment.medications && data.treatment.medications.length > 0) {
			sections.push(createParagraph("Medicamente prescrise:", true));
			for (const med of data.treatment.medications) {
				let medText = `${med.name} - ${med.dosage}, ${med.frequency}`;
				if (med.duration) medText += `, ${med.duration}`;
				if (med.route) medText += `, ${med.route}`;
				if (med.instructions) medText += ` (${med.instructions})`;
				sections.push(createBullet(medText));
			}
		}

		if (data.treatment.procedures && data.treatment.procedures.length > 0) {
			sections.push(createParagraph("Proceduri:", true));
			for (const proc of data.treatment.procedures) {
				sections.push(createBullet(proc));
			}
		}

		if (data.treatment.nonPharmacological && data.treatment.nonPharmacological.length > 0) {
			sections.push(createParagraph("Tratament non-medicamentos:", true));
			for (const nonPharm of data.treatment.nonPharmacological) {
				sections.push(createBullet(nonPharm));
			}
		}
	}

	// RECOMMENDATIONS
	if (data.recommendations) {
		sections.push(createHeading("RECOMANDĂRI"));

		if (data.recommendations.lifestyle && data.recommendations.lifestyle.length > 0) {
			sections.push(createParagraph("Stil de viață:", true));
			for (const lifestyle of data.recommendations.lifestyle) {
				sections.push(createBullet(lifestyle));
			}
		}

		if (data.recommendations.diet && data.recommendations.diet.length > 0) {
			sections.push(createParagraph("Dietă:", true));
			for (const diet of data.recommendations.diet) {
				sections.push(createBullet(diet));
			}
		}

		if (data.recommendations.additionalTests && data.recommendations.additionalTests.length > 0) {
			sections.push(createParagraph("Investigații suplimentare:", true));
			for (const test of data.recommendations.additionalTests) {
				sections.push(createBullet(test));
			}
		}

		if (data.recommendations.followUp) {
			sections.push(createParagraph("Control:", true));
			if (data.recommendations.followUp.date) {
				sections.push(createBullet(`Data: ${data.recommendations.followUp.date}`));
			}
			if (data.recommendations.followUp.reason) {
				sections.push(createBullet(`Motiv: ${data.recommendations.followUp.reason}`));
			}
			if (data.recommendations.followUp.specialist) {
				sections.push(createBullet(`Specialist: ${data.recommendations.followUp.specialist}`));
			}
		}

		if (data.recommendations.warnings && data.recommendations.warnings.length > 0) {
			sections.push(createParagraph("Avertismente:", true));
			for (const warning of data.recommendations.warnings) {
				sections.push(createBullet(warning));
			}
		}
	}

	// CLINICAL NOTES
	if (data.clinicalNotes) {
		sections.push(createHeading("NOTE CLINICE"));

		if (data.clinicalNotes.conclusion) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Concluzie: ", bold: true }),
						new TextRun({ text: data.clinicalNotes.conclusion }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.clinicalNotes.differentialDiagnosis && data.clinicalNotes.differentialDiagnosis.length > 0) {
			sections.push(createParagraph("Diagnostice diferențiale:", true));
			for (const diff of data.clinicalNotes.differentialDiagnosis) {
				sections.push(createBullet(diff));
			}
		}

		if (data.clinicalNotes.additionalNotes) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Note adiționale: ", bold: true }),
						new TextRun({ text: data.clinicalNotes.additionalNotes }),
					],
					spacing: { after: 120 },
				}),
			);
		}
	}

	// METADATA
	if (data.metadata) {
		sections.push(createHeading("INFORMAȚII ADMINISTRATIVE"));

		if (data.metadata.consultationType) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Tip consultație: ", bold: true }),
						new TextRun({ text: data.metadata.consultationType }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.metadata.specialization) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Specialitate: ", bold: true }),
						new TextRun({ text: data.metadata.specialization }),
					],
					spacing: { after: 120 },
				}),
			);
		}

		if (data.metadata.doctorName) {
			sections.push(
				new Paragraph({
					children: [
						new TextRun({ text: "Medic examinator: ", bold: true }),
						new TextRun({ text: data.metadata.doctorName }),
					],
					spacing: { after: 240 },
				}),
			);
		}
	}

	// Create the document
	const doc = new Document({
		sections: [
			{
				properties: {},
				children: sections,
			},
		],
	});

	// Generate and download the file
	const blob = await Packer.toBlob(doc);
	const fileName = `Fisa_Pacient_${patientFullName.replace(/\s+/g, "_")}_${consultationDate.replace(/\//g, "-")}.docx`;
	saveAs(blob, fileName);
}
