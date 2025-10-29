import { Calendar, Mail, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "~/types";

interface PatientInformationProps {
	patient: Patient;
}

export function PatientInformation({ patient }: PatientInformationProps) {
	return (
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
	);
}
