import { createFileRoute } from "@tanstack/react-router";
import { Calendar, FileText, Mail, MapPin, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PatientEntries } from "@/routes/_app/_auth/-components/PatientEntries";
import { entriesData, patientsData } from "~/types";

export const Route = createFileRoute("/_app/_auth/_layout/dashboard/$patientId")({
	component: PatientPage,
});

function PatientPage() {
	const { patientId } = Route.useParams();
	const patient = patientsData.find((p) => p.id === patientId);

	// Filter entries for this patient
	const patientEntries = entriesData.filter((entry) => entry.patientId === patientId);

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

	return (
		<div className="flex h-full w-full flex-col">
			{/* Content */}
			<div className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-6xl space-y-6">
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
								<Button variant="outline">Schedule Appointment</Button>
							</div>
						</CardContent>
					</Card>

					{/* Patient Entries */}
					<Card>
						<CardHeader>
							<CardTitle>Medical Entries</CardTitle>
							<CardDescription>Consultation records and diagnostic information</CardDescription>
						</CardHeader>
						<CardContent>
							<PatientEntries entries={patientEntries} />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
