import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientEntries } from "@/routes/_app/_auth/-components/PatientEntries";
import { PatientInformation } from "@/routes/_app/_auth/-components/PatientInformation";
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
			<div className="flex-1 overflow-auto p-8 md:p-6">
				<div className="mx-auto w-full">
					<Tabs defaultValue="information" className="w-full">
						<TabsList className="mx-auto mb-6 grid w-full max-w-md grid-cols-2">
							<TabsTrigger value="information">Patient Information</TabsTrigger>
							<TabsTrigger value="recordings">Recordings</TabsTrigger>
						</TabsList>

						<TabsContent value="information" className="space-y-6">
							<PatientInformation patient={patient} />
						</TabsContent>

						<TabsContent value="recordings" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Medical Entries</CardTitle>
									<CardDescription>Consultation records and diagnostic information</CardDescription>
								</CardHeader>
								<CardContent>
									<PatientEntries entries={patientEntries} />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
