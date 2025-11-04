import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { toast } from "sonner";
import { UploadCloud, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RecordingUploadProps {
	patientId: Id<"patients">;
}

export function RecordingUpload({ patientId }: RecordingUploadProps) {
	const [file, setFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	const generateUploadUrl = useMutation(api.diagnosisDocuments.generateUploadUrl);
	const createDiagnosisDocument = useMutation(api.diagnosisDocuments.createDiagnosisDocument);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) {
			const selectedFile = acceptedFiles[0];

			// Check file size (5MB limit)
			const maxSize = 5 * 1024 * 1024; // 5MB in bytes
			if (selectedFile.size > maxSize) {
				toast.error(
					`File is too large. Maximum size is 5MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB.`,
				);
				return;
			}

			setFile(selectedFile);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "audio/*": [] },
		multiple: false,
	});

	const uploadWithProgress = (url: string, file: File): Promise<{ storageId: string }> => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					const percentComplete = Math.round((e.loaded / e.total) * 100);
					setUploadProgress(percentComplete);
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve(response);
					} catch (error) {
						reject(new Error("Failed to parse response"));
					}
				} else {
					reject(new Error(`Upload failed with status ${xhr.status}`));
				}
			});

			xhr.addEventListener("error", () => {
				reject(new Error("Upload failed"));
			});

			xhr.addEventListener("abort", () => {
				reject(new Error("Upload aborted"));
			});

			xhr.open("POST", url);
			xhr.setRequestHeader("Content-Type", file.type);
			xhr.send(file);
		});
	};

	const handleUpload = async () => {
		if (!file) return;

		try {
			setIsUploading(true);
			setUploadProgress(0);

			const postUrl = await generateUploadUrl();
			const { storageId } = await uploadWithProgress(postUrl, file);

			setUploadProgress(100);

			await createDiagnosisDocument({
				patientId,
				storageId: storageId as Id<"_storage">,
				metadata: {
					originalFilename: file.name,
					mimeType: file.type,
					fileSize: file.size,
				},
			});

			toast.success("Recording uploaded successfully!");
			setFile(null);
			setUploadProgress(0);
		} catch (error) {
			toast.error("Upload failed. Please try again.");
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center ${
					isDragActive ? "border-primary" : "border-muted"
				}`}
			>
				<input {...getInputProps()} />
				<UploadCloud className="mb-4 h-12 w-12 text-muted-foreground" />
				<p className="font-semibold">Drag & drop an audio file here, or click to select one</p>
				<p className="text-sm text-muted-foreground">All audio formats supported • Max 5MB</p>
			</div>

			{file && !isUploading && (
				<div className="flex items-center justify-between rounded-lg border p-3">
					<div className="flex items-center gap-3">
						<File className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="text-sm">{file.name}</p>
							<p className="text-xs text-muted-foreground">
								{(file.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
					</div>
					<Button variant="ghost" size="icon" onClick={() => setFile(null)}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			)}

			{isUploading && (
				<div className="space-y-2 rounded-lg border p-3">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">
							{uploadProgress === 100 ? "Finalizing..." : `Uploading ${file?.name}...`}
						</p>
						<p className="text-sm text-muted-foreground">{uploadProgress}%</p>
					</div>
					<Progress value={uploadProgress} />
				</div>
			)}

			<Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
				{isUploading ? "Uploading..." : "Upload Recording"}
			</Button>
		</div>
	);
}
