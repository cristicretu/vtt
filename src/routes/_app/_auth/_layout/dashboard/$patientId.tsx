import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useAction } from "convex/react";
import {
	Calendar,
	Download,
	Mail,
	Pause,
	Pencil,
	Phone,
	Play,
	Trash2,
	User,
	FileText,
	Sparkles,
	ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditPatientDialog } from "@/routes/_app/_auth/-components/EditPatientDialog";
import { RecordingUpload } from "@/routes/_app/_auth/-components/RecordingUpload";
import { loadRecording } from "@/routes/_app/_auth/-components/RecordingPlayer";
import { generateMedicalDocx } from "@/lib/docx-generator";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

export const Route = createFileRoute("/_app/_auth/_layout/dashboard/$patientId")({
	component: PatientPage,
});

function PatientPage() {
	const { patientId } = Route.useParams();
	const navigate = useNavigate();
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDocumentDialog, setShowDeleteDocumentDialog] = useState(false);
	const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
	const [isDeletingDocument, setIsDeletingDocument] = useState(false);
	const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());

	// Fetch patient data from Convex
	const patient = useQuery(api.patients.getPatient, {
		patientId: patientId as Id<"patients">,
	});
	const diagnosisDocuments = useQuery(api.diagnosisDocuments.getDiagnosisDocumentsForPatient, {
		patientId: patientId as Id<"patients">,
	});
	const deletePatient = useMutation(api.patients.deletePatient);
	const deleteDiagnosisDocument = useMutation(api.diagnosisDocuments.deleteDiagnosisDocument);
	const generateTranscript = useAction(api.transcript.generateTranscript);
	const generateStructuredOutput = useAction(api.structuredOutput.generateStructuredOutput);

	// Compute full name early for use in effects
	const fullName = patient ? `${patient.name} ${patient.surname}` : "";

	// Track currently playing recording
	useEffect(() => {
		const checkCurrentRecording = () => {
			try {
				const stored = localStorage.getItem("vtt_current_recording");
				if (stored) {
					const recording = JSON.parse(stored);
					setCurrentlyPlayingId(recording.id);
				} else {
					setCurrentlyPlayingId(null);
				}
			} catch (error) {
				console.error("Failed to read current recording:", error);
			}
		};

		// Check on mount
		checkCurrentRecording();

		// Listen for storage changes (from other tabs/components)
		window.addEventListener("storage", checkCurrentRecording);

		// Custom event for same-tab updates
		const handleRecordingChange = () => {
			checkCurrentRecording();
		};
		window.addEventListener("recordingChanged", handleRecordingChange);

		// Poll for changes (as backup)
		const interval = setInterval(checkCurrentRecording, 1000);

		return () => {
			window.removeEventListener("storage", checkCurrentRecording);
			window.removeEventListener("recordingChanged", handleRecordingChange);
			clearInterval(interval);
		};
	}, []);

	// Track playing state
	useEffect(() => {
		const handlePlayingStateChange = (e: Event) => {
			const customEvent = e as CustomEvent<{ isPlaying: boolean }>;
			setIsPlaying(customEvent.detail.isPlaying);
		};

		window.addEventListener("playingStateChanged", handlePlayingStateChange);

		return () => {
			window.removeEventListener("playingStateChanged", handlePlayingStateChange);
		};
	}, []);

	// Expose next/previous recording navigation globally
	useEffect(() => {
		const handleNextRecording = () => {
			if (!diagnosisDocuments || !currentlyPlayingId) return;

			const currentIndex = diagnosisDocuments.findIndex((doc) => doc._id === currentlyPlayingId);
			if (currentIndex === -1 || currentIndex === diagnosisDocuments.length - 1) return;

			const nextDoc = diagnosisDocuments[currentIndex + 1];
			if (nextDoc.fileUrl) {
				loadRecording({
					id: nextDoc._id,
					patientId: nextDoc.patientId,
					patientName: fullName,
					recording: nextDoc.fileUrl,
					createdAt: new Date(nextDoc.dateCreated),
				});
				setCurrentlyPlayingId(nextDoc._id);
				window.dispatchEvent(new Event("recordingChanged"));
			}
		};

		const handlePreviousRecording = () => {
			if (!diagnosisDocuments || !currentlyPlayingId) return;

			const currentIndex = diagnosisDocuments.findIndex((doc) => doc._id === currentlyPlayingId);
			if (currentIndex <= 0) return;

			const prevDoc = diagnosisDocuments[currentIndex - 1];
			if (prevDoc.fileUrl) {
				loadRecording({
					id: prevDoc._id,
					patientId: prevDoc.patientId,
					patientName: fullName,
					recording: prevDoc.fileUrl,
					createdAt: new Date(prevDoc.dateCreated),
				});
				setCurrentlyPlayingId(prevDoc._id);
				window.dispatchEvent(new Event("recordingChanged"));
			}
		};

		(window as any).nextRecording = handleNextRecording;
		(window as any).previousRecording = handlePreviousRecording;

		return () => {
			delete (window as any).nextRecording;
			delete (window as any).previousRecording;
		};
	}, [diagnosisDocuments, currentlyPlayingId, fullName]);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deletePatient({ patientId: patientId as Id<"patients"> });
			toast.success("Patient deleted successfully");
			navigate({ to: "/dashboard" });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete patient");
			setIsDeleting(false);
		}
	};

	const handleDeleteDocument = async () => {
		if (!documentToDelete) return;

		setIsDeletingDocument(true);
		try {
			await deleteDiagnosisDocument({
				documentId: documentToDelete as Id<"diagnosisDocuments">,
			});
			toast.success("Medical entry deleted successfully");
			setShowDeleteDocumentDialog(false);
			setDocumentToDelete(null);

			// Clear the player if this was the currently playing document
			if (currentlyPlayingId === documentToDelete) {
				localStorage.removeItem("vtt_current_recording");
				setCurrentlyPlayingId(null);
				window.dispatchEvent(new Event("recordingChanged"));
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete medical entry");
		} finally {
			setIsDeletingDocument(false);
		}
	};

	const handleStartTranscription = async (documentId: string) => {
		try {
			toast.loading("Starting transcription...");
			await generateTranscript({ documentId: documentId as Id<"diagnosisDocuments"> });
			toast.dismiss();
			toast.success("Transcription started successfully");
		} catch (error) {
			toast.dismiss();
			toast.error(error instanceof Error ? error.message : "Failed to start transcription");
			console.error("Error starting transcription:", error);
		}
	};

	const handleStartAnalysis = async (documentId: string) => {
		try {
			toast.loading("Starting analysis...");
			await generateStructuredOutput({
				documentId: documentId as Id<"diagnosisDocuments">,
			});
			toast.dismiss();
			toast.success("Analysis started successfully");
		} catch (error) {
			toast.dismiss();
			toast.error(error instanceof Error ? error.message : "Failed to start analysis");
			console.error("Error starting analysis:", error);
		}
	};

	const handleDownloadDocx = async (doc: any) => {
		try {
			if (!doc.structuredOutput) {
				toast.error("No structured medical data available for this document");
				return;
			}

			toast.loading("Generating DOCX file...");

			// Format the date for the filename
			const date = new Date(doc.dateCreated).toLocaleDateString("ro-RO");

			// Generate and download the DOCX file
			await generateMedicalDocx(doc.structuredOutput, fullName, date);

			toast.dismiss();
			toast.success("DOCX file downloaded successfully");
		} catch (error) {
			toast.dismiss();
			toast.error(error instanceof Error ? error.message : "Failed to generate DOCX file");
			console.error("Error generating DOCX:", error);
		}
	};

	if (patient === undefined) {
		return (
			<div className="flex h-full items-center justify-center p-8">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Loading...</CardTitle>
						<CardDescription>Fetching patient data...</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

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
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Personal Information</CardTitle>
									<CardDescription>Basic patient details and contact information</CardDescription>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
										<Pencil className="mr-2 h-4 w-4" />
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowDeleteDialog(true)}
										className="text-destructive hover:text-destructive"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="flex items-start gap-3">
									<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">Full Name</p>
										<p className="text-muted-foreground text-sm">{fullName}</p>
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
								{patient.email && (
									<div className="flex items-start gap-3">
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="space-y-1">
											<p className="font-medium text-sm">Email</p>
											<p className="text-muted-foreground text-sm">{patient.email}</p>
										</div>
									</div>
								)}
								{patient.phone && (
									<div className="flex items-start gap-3">
										<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="space-y-1">
											<p className="font-medium text-sm">Phone</p>
											<p className="text-muted-foreground text-sm">{patient.phone}</p>
										</div>
									</div>
								)}
								<div className="flex items-start gap-3">
									<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-sm">CNP</p>
										<p className="text-muted-foreground text-sm">{patient.cnp}</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Upload Recording */}
					<Card>
						<CardHeader>
							<CardTitle>Upload Recording</CardTitle>
							<CardDescription>
								Upload an audio recording for this patient's consultation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<RecordingUpload patientId={patientId as Id<"patients">} />
						</CardContent>
					</Card>

					{/* Patient Entries */}
					<Card>
						<CardHeader>
							<CardTitle>Medical Entries</CardTitle>
							<CardDescription>Consultation records and diagnostic information</CardDescription>
						</CardHeader>
						<CardContent>
							{!diagnosisDocuments || diagnosisDocuments.length === 0 ? (
								<div className="text-center text-muted-foreground text-sm py-8">
									No medical entries yet. Upload a recording to get started.
								</div>
							) : (
								<div className="space-y-4">
									{diagnosisDocuments.map((doc) => {
										const isCurrentRecording = currentlyPlayingId === doc._id;
										const isActiveAndPlaying = isCurrentRecording && isPlaying;
										const isExpanded = expandedDocuments.has(doc._id);
										const toggleExpanded = () => {
											setExpandedDocuments((prev) => {
												const next = new Set(prev);
												if (next.has(doc._id)) {
													next.delete(doc._id);
												} else {
													next.add(doc._id);
												}
												return next;
											});
										};

										return (
											<Collapsible key={doc._id} open={isExpanded} onOpenChange={toggleExpanded}>
												<Card
													className={`overflow-hidden transition-all ${
														isCurrentRecording ? "ring-2 ring-primary shadow-lg" : ""
													}`}
												>
													<CardContent className="p-3">
														<div className="flex items-center gap-3 justify-between">
															{/* Left side: Play button and Date */}
															<div className="flex items-center gap-3 min-w-0">
																{/* Play/Pause Button */}
																{doc.fileUrl && (
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 shrink-0"
																		onClick={() => {
																			if (isActiveAndPlaying) {
																				// If this recording is currently playing, pause it
																				const win = window as any;
																				if (win.togglePlayPause) {
																					win.togglePlayPause();
																				}
																			} else if (isCurrentRecording && !isPlaying) {
																				// If this recording is loaded but paused, resume it
																				const win = window as any;
																				if (win.togglePlayPause) {
																					win.togglePlayPause();
																				}
																			} else {
																				// Load and play this recording
																				loadRecording({
																					id: doc._id,
																					patientId: doc.patientId,
																					patientName: fullName,
																					recording: doc.fileUrl || "",
																					createdAt: new Date(doc.dateCreated),
																				});
																				setCurrentlyPlayingId(doc._id);
																				window.dispatchEvent(new Event("recordingChanged"));
																			}
																		}}
																	>
																		{isActiveAndPlaying ? (
																			<Pause className="h-4 w-4 fill-current" />
																		) : (
																			<Play className="h-4 w-4" />
																		)}
																	</Button>
																)}

																{/* Date & Time */}
																<span className="text-sm font-medium truncate">
																	{new Date(doc.dateCreated).toLocaleDateString("en-US", {
																		month: "short",
																		day: "numeric",
																		year: "numeric",
																		hour: "2-digit",
																		minute: "2-digit",
																	})}
																</span>
															</div>

															{/* Right side: Status badges, Duration, File size, Action buttons */}
															<div className="flex items-center gap-3 flex-wrap justify-end">
																{/* Status Badges */}
																<div className="flex items-center gap-1.5 flex-wrap">
																	<div className="flex items-center gap-1">
																		<span className="text-xs text-muted-foreground">
																			Transcript:
																		</span>
																		<Badge
																			variant={
																				doc.transcriptStatus === "completed"
																					? "default"
																					: "secondary"
																			}
																			className="text-xs py-0 h-5"
																		>
																			{doc.transcriptStatus || "pending"}
																		</Badge>
																	</div>
																	<div className="flex items-center gap-1">
																		<span className="text-xs text-muted-foreground">Analysis:</span>
																		<Badge
																			variant={
																				doc.structuredOutputStatus === "completed"
																					? "default"
																					: "secondary"
																			}
																			className="text-xs py-0 h-5"
																		>
																			{doc.structuredOutputStatus || "pending"}
																		</Badge>
																	</div>
																</div>

																{/* Duration */}
																{doc.audioMetadata?.duration && (
																	<span className="text-xs text-muted-foreground whitespace-nowrap">
																		{Math.floor(doc.audioMetadata.duration / 60)}:
																		{Math.floor(doc.audioMetadata.duration % 60)
																			.toString()
																			.padStart(2, "0")}
																	</span>
																)}

																{/* File Size */}
																{doc.audioMetadata?.fileSize && (
																	<span className="text-xs text-muted-foreground whitespace-nowrap">
																		{(doc.audioMetadata.fileSize / 1024 / 1024).toFixed(1)} MB
																	</span>
																)}

																{/* Transcribe Button - Show if transcript is pending or failed */}
																{(doc.transcriptStatus === "pending" ||
																	doc.transcriptStatus === "failed") && (
																	<Button
																		variant="outline"
																		size="sm"
																		className="h-8 shrink-0 text-xs"
																		onClick={() => handleStartTranscription(doc._id)}
																		title="Start transcription"
																	>
																		<FileText className="h-3 w-3 mr-1" />
																		Transcribe
																	</Button>
																)}

																{/* Analyze Button - Show if transcript is completed */}
																{doc.transcriptStatus === "completed" && (
																	<Button
																		variant="outline"
																		size="sm"
																		className="h-8 shrink-0 text-xs"
																		onClick={() => handleStartAnalysis(doc._id)}
																		title={
																			doc.structuredOutputStatus === "completed"
																				? "Re-analyze"
																				: "Start analysis"
																		}
																	>
																		<Sparkles className="h-3 w-3 mr-1" />
																		{doc.structuredOutputStatus === "completed"
																			? "Re-analyze"
																			: "Analyze"}
																	</Button>
																)}

																{/* Download DOCX Button - Only show when structuredOutputStatus is completed */}
																{doc.structuredOutputStatus === "completed" && (
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 shrink-0 text-primary hover:text-primary"
																		onClick={() => handleDownloadDocx(doc)}
																		title="Download DOCX"
																	>
																		<Download className="h-4 w-4" />
																	</Button>
																)}

																{/* Delete Button */}
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
																	onClick={() => {
																		setDocumentToDelete(doc._id);
																		setShowDeleteDocumentDialog(true);
																	}}
																>
																	<Trash2 className="h-4 w-4" />
																</Button>

																{/* Show Analysis Toggle - Show when transcript is completed */}
																{doc.transcriptStatus === "completed" && (
																	<CollapsibleTrigger asChild>
																		<Button
																			variant="ghost"
																			size="sm"
																			className="h-8 shrink-0 text-xs gap-1"
																		>
																			{isExpanded ? "Hide" : "Show"} Details
																			<ChevronDown
																				className={`h-3 w-3 transition-transform ${
																					isExpanded ? "rotate-180" : ""
																				}`}
																			/>
																		</Button>
																	</CollapsibleTrigger>
																)}
															</div>
														</div>

														{/* Collapsible Details Section */}
														{doc.transcriptStatus === "completed" && (
															<CollapsibleContent className="pt-3 border-t mt-3">
																<div className="space-y-3 text-sm">
																	{/* Transcript */}
																	{doc.transcript && (
																		<div>
																			<h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
																				Transcripție
																			</h4>
																			<p className="text-sm whitespace-pre-wrap">
																				{doc.transcript}
																			</p>
																		</div>
																	)}

																	{/* Separator if both transcript and analysis exist */}
																	{doc.transcript && doc.structuredOutput && (
																		<div className="border-t my-3" />
																	)}

																	{/* Analysis Results - Only show if completed */}
																	{!doc.structuredOutput &&
																		doc.structuredOutputStatus === "completed" && (
																			<div className="text-sm text-muted-foreground italic">
																				Analysis completed but no structured data was extracted. Try
																				re-analyzing.
																			</div>
																		)}

																	{/* Structured Analysis Data */}
																	{doc.structuredOutput && (
																		<>
																			{/* Diagnosis */}
																			{doc.structuredOutput.diagnosis && (
																				<div>
																					<h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
																						Diagnostic
																					</h4>
																					<p className="text-sm">
																						{doc.structuredOutput.diagnosis.main}
																					</p>
																					{doc.structuredOutput.diagnosis.icd10Code && (
																						<p className="text-xs text-muted-foreground mt-1">
																							ICD-10: {doc.structuredOutput.diagnosis.icd10Code}
																						</p>
																					)}
																				</div>
																			)}

																			{/* Complaints */}
																			{doc.structuredOutput.complaints?.chief && (
																				<div>
																					<h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
																						Plângeri
																					</h4>
																					<p className="text-sm">
																						{doc.structuredOutput.complaints.chief}
																					</p>
																					{doc.structuredOutput.complaints.symptoms &&
																						doc.structuredOutput.complaints.symptoms.length > 0 && (
																							<ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
																								{doc.structuredOutput.complaints.symptoms.map(
																									(symptom: string, idx: number) => (
																										<li key={idx}>{symptom}</li>
																									),
																								)}
																							</ul>
																						)}
																				</div>
																			)}

																			{/* Treatment */}
																			{doc.structuredOutput.treatment?.medications &&
																				doc.structuredOutput.treatment.medications.length > 0 && (
																					<div>
																						<h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
																							Tratament
																						</h4>
																						<div className="space-y-2">
																							{doc.structuredOutput.treatment.medications.map(
																								(med: any, idx: number) => (
																									<div key={idx} className="text-sm">
																										<span className="font-medium">{med.name}</span>{" "}
																										- {med.dosage}, {med.frequency}
																										{med.duration && <span> ({med.duration})</span>}
																									</div>
																								),
																							)}
																						</div>
																					</div>
																				)}

																			{/* Recommendations */}
																			{doc.structuredOutput.recommendations?.lifestyle &&
																				doc.structuredOutput.recommendations.lifestyle.length >
																					0 && (
																					<div>
																						<h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
																							Recomandări
																						</h4>
																						<ul className="text-sm list-disc list-inside">
																							{doc.structuredOutput.recommendations.lifestyle.map(
																								(rec: string, idx: number) => (
																									<li key={idx}>{rec}</li>
																								),
																							)}
																						</ul>
																					</div>
																				)}

																			{/* Clinical Notes */}
																			{doc.structuredOutput.clinicalNotes?.conclusion && (
																				<div>
																					<h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
																						Concluzii
																					</h4>
																					<p className="text-sm">
																						{doc.structuredOutput.clinicalNotes.conclusion}
																					</p>
																				</div>
																			)}
																		</>
																	)}
																</div>
															</CollapsibleContent>
														)}
													</CardContent>
												</Card>
											</Collapsible>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Edit Patient Dialog */}
			<EditPatientDialog patient={patient} open={showEditDialog} onOpenChange={setShowEditDialog} />

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the patient record for{" "}
							<strong>{fullName}</strong> and all associated medical records and recordings.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete Patient"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Document Confirmation Dialog */}
			<AlertDialog open={showDeleteDocumentDialog} onOpenChange={setShowDeleteDocumentDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Medical Entry?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete this medical entry and its
							associated recording file.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeletingDocument}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteDocument}
							disabled={isDeletingDocument}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeletingDocument ? "Deleting..." : "Delete Entry"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
