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
	email: string;
	phone: string;
	address: string;
	medicalHistory?: string;
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
		recording: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3",
		transcript:
			"Patient reports mild chest discomfort during exercise. Blood pressure 120/80. Heart rate normal. Recommended stress test and follow-up in two weeks.",
		diagnostic: "Possible angina - stress test required",
	},
	{
		id: "entry-2",
		patientId: "1",
		createdAt: new Date("2024-10-15T14:15:00"),
		updatedAt: new Date("2024-10-16T09:00:00"),
		recording: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3",
		transcript:
			"Routine checkup. Patient feeling well. Blood work results normal. Continue current medications.",
		diagnostic: "Healthy - routine follow-up",
	},
];
