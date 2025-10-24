import { createFileRoute } from "@tanstack/react-router";
import { Calendar, FileText, Mail, MapPin, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { patientsData } from "~/types";

export const Route = createFileRoute("/_app/_auth/_layout/dashboard/$patientId")({
	component: PatientPage,
});

function PatientPage() {
	const { patientId } = Route.useParams();
	const patient = patientsData.find((p) => p.id === patientId);

	if (!patient) {
		return (
			<div className="flex h-full items-center justify-center p-8">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Patient Not Found</CardTitle>
						<CardDescription>The patient you're looking for doesn't exist.</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex h-16 items-center justify-between px-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 via-cyan-300 to-blue-500">
							<User className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="font-semibold text-lg">{patient.fullName}</h1>
							<p className="text-muted-foreground text-sm">Patient ID: {patient.id}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="gap-1">
							<Calendar className="h-3 w-3" />
							{age} years old
						</Badge>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardTitle>Personal Information</CardTitle>
							<CardDescription>Basic patient details and contact information</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="flex items-start gap-3">
									<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">Full Name</p>
										<p className="text-muted-foreground text-sm">{patient.fullName}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">Date of Birth</p>
										<p className="text-muted-foreground text-sm">
											{new Date(patient.dateOfBirth).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">Email</p>
										<p className="text-muted-foreground text-sm">{patient.email}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">Phone</p>
										<p className="text-muted-foreground text-sm">{patient.phone}</p>
									</div>
								</div>
								<div className="flex items-start gap-3 md:col-span-2">
									<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">Address</p>
										<p className="text-muted-foreground text-sm">{patient.address}</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Medical History */}
					<Card>
						<CardHeader>
							<CardTitle>Medical History</CardTitle>
							<CardDescription>Patient's medical background and notes</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-start gap-3">
								<FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">{patient.medicalHistory}</p>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex gap-2">
						<Button>Schedule Appointment</Button>
						<Button variant="outline">View Records</Button>
						<Button variant="outline">Send Message</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
