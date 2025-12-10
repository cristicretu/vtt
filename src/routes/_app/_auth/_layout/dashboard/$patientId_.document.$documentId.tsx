import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Download, Loader2, Check, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { JSONContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { TiptapEditor, type TiptapEditorRef } from "@/components/editor";
import { medicalOutputToTiptap } from "@/lib/content-converter";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

export const Route = createFileRoute(
	"/_app/_auth/_layout/dashboard/$patientId/document/$documentId",
)({
	component: DocumentEditorPage,
});

type SaveStatus = "idle" | "saving" | "saved" | "error";

function DocumentEditorPage() {
	const { patientId, documentId } = Route.useParams();
	const navigate = useNavigate();

	const [editorContent, setEditorContent] = useState<JSONContent | null>(null);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [isInitialized, setIsInitialized] = useState(false);
	const editorRef = useRef<TiptapEditorRef>(null);

	// Fetch document and patient data
	const document = useQuery(api.diagnosisDocuments.getDiagnosisDocument, {
		documentId: documentId as Id<"diagnosisDocuments">,
	});

	const patient = useQuery(api.patients.getPatient, {
		patientId: patientId as Id<"patients">,
	});

	const updateEditedContent = useMutation(api.diagnosisDocuments.updateEditedContent);

	// Initialize editor content from document
	useEffect(() => {
		if (document && !isInitialized) {
			if (document.editedContent) {
				// Use existing edited content
				setEditorContent(document.editedContent as JSONContent);
			} else if (document.structuredOutput) {
				// Convert structured output to TipTap format
				const tiptapContent = medicalOutputToTiptap(
					document.structuredOutput,
					new Date(document.dateCreated).toLocaleDateString("ro-RO"),
				);
				setEditorContent(tiptapContent);
			}
			setIsInitialized(true);
		}
	}, [document, isInitialized]);

	// Handle content updates with auto-save
	const handleContentUpdate = useCallback(
		async (content: JSONContent) => {
			setEditorContent(content);
			setSaveStatus("saving");

			try {
				await updateEditedContent({
					documentId: documentId as Id<"diagnosisDocuments">,
					editedContent: content,
				});
				setSaveStatus("saved");

				// Reset to idle after 2 seconds
				setTimeout(() => {
					setSaveStatus("idle");
				}, 2000);
			} catch (error) {
				console.error("Failed to save:", error);
				setSaveStatus("error");
				toast.error("Failed to save changes");
			}
		},
		[documentId, updateEditedContent],
	);

	// Handle DOCX download
	const handleDownloadDocx = async () => {
		// Get the latest content directly from the editor (bypasses debounce)
		const currentContent = editorRef.current?.getContent() || editorContent;

		if (!currentContent || !patient) {
			toast.error("No content to download");
			return;
		}

		try {
			toast.loading("Generating DOCX file...");

			const fullName = `${patient.name} ${patient.surname}`;
			const date = document
				? new Date(document.dateCreated).toLocaleDateString("ro-RO")
				: new Date().toLocaleDateString("ro-RO");

			// Generate DOCX directly from TipTap content (preserves all content)
			const { generateDocxFromTiptap } = await import("@/lib/tiptap-to-docx");
			await generateDocxFromTiptap(currentContent, fullName, date);

			toast.dismiss();
			toast.success("DOCX file downloaded successfully");
		} catch (error) {
			toast.dismiss();
			toast.error(error instanceof Error ? error.message : "Failed to generate DOCX");
			console.error("Error generating DOCX:", error);
		}
	};

	// Handle back navigation
	const handleBack = () => {
		navigate({
			to: "/dashboard/$patientId",
			params: { patientId },
		});
	};

	// Loading state
	if (document === undefined || patient === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Error states
	if (!document) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="text-xl font-semibold">Document Not Found</h2>
				<p className="text-muted-foreground">The document you're looking for doesn't exist.</p>
				<Button onClick={handleBack}>Back to Patient</Button>
			</div>
		);
	}

	if (!patient) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<h2 className="text-xl font-semibold">Patient Not Found</h2>
				<p className="text-muted-foreground">The patient you're looking for doesn't exist.</p>
				<Button onClick={() => navigate({ to: "/dashboard" })}>Back to Dashboard</Button>
			</div>
		);
	}

	if (!document.structuredOutput && !document.editedContent) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4">
				<AlertCircle className="h-12 w-12 text-yellow-500" />
				<h2 className="text-xl font-semibold">No Content Available</h2>
				<p className="text-muted-foreground">
					This document hasn't been analyzed yet. Please run the analysis first.
				</p>
				<Button onClick={handleBack}>Back to Patient</Button>
			</div>
		);
	}

	const fullName = `${patient.name} ${patient.surname}`;

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<header className="editor-header flex items-center justify-between border-b border-border bg-background px-6 py-[10px]">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={handleBack} title="Back to Patient">
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-lg font-semibold">{fullName}</h1>
						<p className="text-sm text-muted-foreground">
							Document from {new Date(document.dateCreated).toLocaleDateString("ro-RO")}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					{/* Save status indicator */}
					<div className="flex items-center gap-2 text-sm">
						{saveStatus === "saving" && (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-muted-foreground">Saving...</span>
							</>
						)}
						{saveStatus === "saved" && (
							<>
								<Check className="h-4 w-4 text-green-500" />
								<span className="text-green-500">Saved</span>
							</>
						)}
						{saveStatus === "error" && (
							<>
								<AlertCircle className="h-4 w-4 text-destructive" />
								<span className="text-destructive">Error saving</span>
							</>
						)}
					</div>

					<Button onClick={handleDownloadDocx} disabled={!editorContent}>
						<Download className="mr-2 h-4 w-4" />
						Download DOCX
					</Button>
				</div>
			</header>

			{/* Editor */}
			<main className="flex-1 overflow-auto bg-muted/30 p-6">
				<div className="mx-auto max-w-4xl">
					{editorContent ? (
						<TiptapEditor
							ref={editorRef}
							content={editorContent}
							onUpdate={handleContentUpdate}
							debounceMs={1000}
						/>
					) : (
						<div className="flex h-96 items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					)}
				</div>
			</main>

			{/* Status bar */}
			<footer className="editor-status flex items-center justify-between border-t border-border bg-background px-6 py-2 text-xs text-muted-foreground">
				<span>Last modified: {new Date(document.dateLastModified).toLocaleString("ro-RO")}</span>
				<span>Auto-save enabled</span>
			</footer>
		</div>
	);
}
