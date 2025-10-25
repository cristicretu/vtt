import type { Doc } from "~/convex/_generated/dataModel";
import type { PlanKey } from "~/convex/schema";

export type User = Doc<"users"> & {
	avatarUrl?: string;
	subscription?: Doc<"subscriptions"> & {
		planKey: PlanKey;
	};
};

export type Patient = {
	id: string;
	fullName: string;
	dateOfBirth: string;
};

export type Entry = {
	id: string;
	patientId: string;
	createdAt: Date;
	updatedAt: Date;
	recording: string; // URL or path to audio recording
	transcript: string;
	diagnostic: string | "Not set";
};

export const patientsData = [
	{
		id: "1",
		fullName: "John Smith",
		dateOfBirth: "1985-03-15",
		email: "john.smith@email.com",
		phone: "+1 (555) 123-4567",
		address: "123 Main St, New York, NY 10001",
		medicalHistory: "No major health issues. Regular checkups.",
	},
	{
		id: "2",
		fullName: "Sarah Johnson",
		dateOfBirth: "1990-07-22",
		email: "sarah.j@email.com",
		phone: "+1 (555) 234-5678",
		address: "456 Oak Ave, Los Angeles, CA 90001",
		medicalHistory: "Allergy to penicillin. Asthma patient.",
	},
	{
		id: "3",
		fullName: "Michael Brown",
		dateOfBirth: "1978-11-08",
		email: "m.brown@email.com",
		phone: "+1 (555) 345-6789",
		address: "789 Pine Rd, Chicago, IL 60601",
		medicalHistory: "Type 2 diabetes. Monitoring required.",
	},
	{
		id: "4",
		fullName: "Emily Davis",
		dateOfBirth: "1995-02-14",
		email: "emily.d@email.com",
		phone: "+1 (555) 456-7890",
		address: "321 Elm St, Houston, TX 77001",
		medicalHistory: "Healthy. No major concerns.",
	},
	{
		id: "5",
		fullName: "David Wilson",
		dateOfBirth: "1988-05-30",
		email: "d.wilson@email.com",
		phone: "+1 (555) 567-8901",
		address: "654 Maple Dr, Phoenix, AZ 85001",
		medicalHistory: "Previous knee surgery. Recovering well.",
	},
	{
		id: "6",
		fullName: "Lisa Anderson",
		dateOfBirth: "1992-09-18",
		email: "lisa.a@email.com",
		phone: "+1 (555) 678-9012",
		address: "987 Cedar Ln, Philadelphia, PA 19101",
		medicalHistory: "Migraine patient. Prescribed medication.",
	},
];

export const entriesData: Entry[] = [
	{
		id: "entry-1",
		patientId: "1",
		createdAt: new Date("2024-10-20T10:30:00"),
		updatedAt: new Date("2024-10-20T10:30:00"),
		recording: "/recordings/john-smith-20241020.wav",
		transcript:
			"Patient reports mild chest discomfort during exercise. Blood pressure 120/80. Heart rate normal. Recommended stress test and follow-up in two weeks.",
		diagnostic: "Possible angina - stress test required",
	},
	{
		id: "entry-2",
		patientId: "1",
		createdAt: new Date("2024-10-15T14:15:00"),
		updatedAt: new Date("2024-10-16T09:00:00"),
		recording: "/recordings/john-smith-20241015.wav",
		transcript:
			"Routine checkup. Patient feeling well. Blood work results normal. Continue current medications.",
		diagnostic: "Healthy - routine follow-up",
	},
	{
		id: "entry-3",
		patientId: "2",
		createdAt: new Date("2024-10-18T11:00:00"),
		updatedAt: new Date("2024-10-18T11:00:00"),
		recording: "/recordings/sarah-johnson-20241018.wav",
		transcript:
			"Asthma symptoms worsening. Increased use of rescue inhaler. Wheezing present on examination. Adjusted medication dosage.",
		diagnostic: "Asthma exacerbation",
	},
	{
		id: "entry-4",
		patientId: "2",
		createdAt: new Date("2024-10-10T16:30:00"),
		updatedAt: new Date("2024-10-10T16:30:00"),
		recording: "/recordings/sarah-johnson-20241010.wav",
		transcript:
			"Follow-up on allergy testing. Confirmed penicillin allergy. Updated medical records. Prescribed alternative antibiotics.",
		diagnostic: "Penicillin allergy confirmed",
	},
	{
		id: "entry-5",
		patientId: "3",
		createdAt: new Date("2024-10-22T09:45:00"),
		updatedAt: new Date("2024-10-22T09:45:00"),
		recording: "/recordings/michael-brown-20241022.wav",
		transcript:
			"Diabetes management review. HbA1c levels slightly elevated at 7.2%. Discussed dietary modifications and exercise routine.",
		diagnostic: "Type 2 diabetes - monitoring",
	},
	{
		id: "entry-6",
		patientId: "3",
		createdAt: new Date("2024-10-05T13:20:00"),
		updatedAt: new Date("2024-10-06T10:00:00"),
		recording: "/recordings/michael-brown-20241005.wav",
		transcript:
			"Patient experiencing peripheral neuropathy symptoms. Tingling in feet. Blood sugar levels fluctuating. Adjusted insulin regimen.",
		diagnostic: "Diabetic neuropathy - early stage",
	},
	{
		id: "entry-7",
		patientId: "4",
		createdAt: new Date("2024-10-19T15:00:00"),
		updatedAt: new Date("2024-10-19T15:00:00"),
		recording: "/recordings/emily-davis-20241019.wav",
		transcript:
			"Annual wellness exam. All vital signs normal. No concerns reported. Recommended preventive screenings.",
		diagnostic: "Not set",
	},
	{
		id: "entry-8",
		patientId: "5",
		createdAt: new Date("2024-10-21T10:00:00"),
		updatedAt: new Date("2024-10-21T10:00:00"),
		recording: "/recordings/david-wilson-20241021.wav",
		transcript:
			"Post-surgical follow-up. Knee healing well. Range of motion improving. Physical therapy progressing as expected.",
		diagnostic: "Post-operative recovery - good progress",
	},
	{
		id: "entry-9",
		patientId: "6",
		createdAt: new Date("2024-10-17T14:30:00"),
		updatedAt: new Date("2024-10-17T14:30:00"),
		recording: "/recordings/lisa-anderson-20241017.wav",
		transcript:
			"Migraine frequency increased to 3-4 times per week. Current medication not providing adequate relief. Prescribed new preventive medication.",
		diagnostic: "Chronic migraine - treatment adjustment",
	},
	{
		id: "entry-10",
		patientId: "1",
		createdAt: new Date("2024-10-01T08:30:00"),
		updatedAt: new Date("2024-10-01T08:30:00"),
		recording: "/recordings/john-smith-20241001.wav",
		transcript:
			"Initial consultation for cardiovascular screening. Family history of heart disease. Ordered lipid panel and ECG.",
		diagnostic: "Not set",
	},
];
