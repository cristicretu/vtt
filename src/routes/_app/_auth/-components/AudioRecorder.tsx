import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { Mic, Upload, Trash2, Loader2, Play, Pause } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioDevices } from "@/components/ui/mic-selector";
import { cn } from "@/lib/utils";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

interface AudioRecorderProps {
	patientId: Id<"patients">;
}

const STORAGE_KEY_PREFIX = "vtt_pending_recording_";

interface StoredRecording {
	blob: string; // Base64 encoded
	mimeType: string;
	duration: number;
	timestamp: number;
}

/**
 * Convert Blob to Base64 string for localStorage
 */
async function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const result = reader.result as string;
			resolve(result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

/**
 * Convert Base64 string back to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
	const byteString = atob(base64.split(",")[1]);
	const arrayBuffer = new ArrayBuffer(byteString.length);
	const uint8Array = new Uint8Array(arrayBuffer);

	for (let i = 0; i < byteString.length; i++) {
		uint8Array[i] = byteString.charCodeAt(i);
	}

	return new Blob([arrayBuffer], { type: mimeType });
}

/**
 * Format seconds to M:SS
 */
function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format seconds to MM:SS for the main timer display
 */
function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Custom mini audio player matching the app's design
 */
interface MiniPlayerProps {
	src: string;
	duration: number;
}

function MiniPlayer({ src, duration }: MiniPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [audioDuration, setAudioDuration] = useState<number | null>(null);

	// Use audio element duration if valid, otherwise fall back to prop
	const effectiveDuration = (audioDuration !== null && Number.isFinite(audioDuration) && audioDuration > 0)
		? audioDuration
		: duration;

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
		const handleDurationChange = () => {
			// Only use audio.duration if it's a valid finite number
			if (Number.isFinite(audio.duration) && audio.duration > 0) {
				setAudioDuration(audio.duration);
			}
		};
		const handleLoadedMetadata = () => {
			// Also try to get duration when metadata loads
			if (Number.isFinite(audio.duration) && audio.duration > 0) {
				setAudioDuration(audio.duration);
			}
		};
		const handleEnded = () => setIsPlaying(false);
		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);

		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("durationchange", handleDurationChange);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);

		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("durationchange", handleDurationChange);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
		};
	}, []);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
	};

	const handleSeek = (value: number[]) => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.currentTime = value[0];
		setCurrentTime(value[0]);
	};

	return (
		<div className="flex items-center gap-3 rounded-full bg-muted/50 px-3 py-2">
			<audio ref={audioRef} src={src} preload="metadata" />

			{/* Play/Pause button */}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90"
				onClick={togglePlay}
			>
				{isPlaying ? (
					<Pause className="h-4 w-4 fill-current" />
				) : (
					<Play className="h-4 w-4 fill-current ml-0.5" />
				)}
			</Button>

			{/* Current time */}
			<span className="text-sm text-muted-foreground tabular-nums min-w-[40px]">
				{formatTime(currentTime)}
			</span>

			{/* Progress slider */}
			<SliderPrimitive.Root
				value={[currentTime]}
				onValueChange={handleSeek}
				min={0}
				max={effectiveDuration || 1}
				step={0.1}
				className="group/player relative flex h-4 flex-1 touch-none select-none items-center"
			>
				<SliderPrimitive.Track className="relative h-[4px] w-full grow overflow-hidden rounded-full bg-muted">
					<SliderPrimitive.Range className="absolute h-full bg-primary" />
				</SliderPrimitive.Track>
				<SliderPrimitive.Thumb className="relative flex h-0 w-0 items-center justify-center opacity-0 focus-visible:opacity-100 focus-visible:outline-none group-hover/player:opacity-100">
					<div className="absolute size-3 rounded-full bg-foreground" />
				</SliderPrimitive.Thumb>
			</SliderPrimitive.Root>

			{/* Duration */}
			<span className="text-sm text-muted-foreground tabular-nums min-w-[40px]">
				{formatTime(effectiveDuration)}
			</span>
		</div>
	);
}

export function AudioRecorder({ patientId }: AudioRecorderProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [restoredRecording, setRestoredRecording] = useState<{
		blob: Blob;
		duration: number;
		url: string;
	} | null>(null);

	const { devices } = useAudioDevices();
	const defaultDeviceId = devices[0]?.deviceId;

	const {
		state,
		duration,
		audioBlob,
		audioUrl,
		mimeType,
		isSupported,
		startRecording,
		stopRecording,
		clearRecording,
	} = useAudioRecorder({
		deviceId: defaultDeviceId,
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const generateUploadUrl = useMutation(api.diagnosisDocuments.generateUploadUrl);
	const createDiagnosisDocument = useMutation(api.diagnosisDocuments.createDiagnosisDocument);

	const storageKey = `${STORAGE_KEY_PREFIX}${patientId}`;

	// Restore recording from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				const data: StoredRecording = JSON.parse(stored);
				const blob = base64ToBlob(data.blob, data.mimeType);
				const url = URL.createObjectURL(blob);
				setRestoredRecording({
					blob,
					duration: data.duration,
					url,
				});
			}
		} catch (error) {
			console.error("Failed to restore recording:", error);
			localStorage.removeItem(storageKey);
		}
	}, [storageKey]);

	// Save recording to localStorage when stopped
	useEffect(() => {
		if (state === "stopped" && audioBlob) {
			(async () => {
				try {
					const base64 = await blobToBase64(audioBlob);
					const data: StoredRecording = {
						blob: base64,
						mimeType,
						duration,
						timestamp: Date.now(),
					};
					localStorage.setItem(storageKey, JSON.stringify(data));
				} catch (error) {
					console.error("Failed to save recording:", error);
				}
			})();
		}
	}, [state, audioBlob, mimeType, duration, storageKey]);

	// Cleanup restored recording URL on unmount
	useEffect(() => {
		return () => {
			if (restoredRecording?.url) {
				URL.revokeObjectURL(restoredRecording.url);
			}
		};
	}, [restoredRecording?.url]);

	const uploadWithProgress = useCallback(
		(url: string, blob: Blob, contentType: string): Promise<{ storageId: string }> => {
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

				xhr.addEventListener("error", () => reject(new Error("Upload failed")));
				xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

				xhr.open("POST", url);
				xhr.setRequestHeader("Content-Type", contentType);
				xhr.send(blob);
			});
		},
		[],
	);

	const handleUpload = async () => {
		const blobToUpload = audioBlob || restoredRecording?.blob;
		const durationToUpload = audioBlob ? duration : restoredRecording?.duration || 0;
		const contentType = audioBlob ? mimeType : restoredRecording?.blob.type || mimeType;

		if (!blobToUpload) return;

		try {
			setIsUploading(true);
			setUploadProgress(0);

			const postUrl = await generateUploadUrl();
			const { storageId } = await uploadWithProgress(postUrl, blobToUpload, contentType);

			setUploadProgress(100);

			await createDiagnosisDocument({
				patientId,
				storageId: storageId as Id<"_storage">,
				metadata: {
					originalFilename: `recording_${new Date().toISOString()}.webm`,
					mimeType: contentType,
					fileSize: blobToUpload.size,
					duration: durationToUpload,
				},
			});

			toast.success("Recording uploaded successfully!");

			// Clear everything
			localStorage.removeItem(storageKey);
			clearRecording();
			if (restoredRecording?.url) {
				URL.revokeObjectURL(restoredRecording.url);
			}
			setRestoredRecording(null);
			setUploadProgress(0);
		} catch (error) {
			toast.error("Upload failed. Please try again.");
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleDiscard = () => {
		localStorage.removeItem(storageKey);
		clearRecording();
		if (restoredRecording?.url) {
			URL.revokeObjectURL(restoredRecording.url);
		}
		setRestoredRecording(null);
	};

	if (!isSupported) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center">
				<Mic className="mb-4 h-12 w-12 text-muted-foreground" />
				<p className="text-sm text-muted-foreground">
					Audio recording is not supported in this browser.
				</p>
			</div>
		);
	}

	// Show restored recording if exists and not currently recording
	const hasRecording = audioBlob || restoredRecording;
	const currentDuration = audioBlob ? duration : restoredRecording?.duration || 0;
	const currentAudioUrl = audioUrl || restoredRecording?.url;

	return (
		<div className="space-y-4">
			{/* Waveform visualization - matches upload dropzone height */}
			<div
				className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center border-muted"
			>
				<Mic className="mb-4 h-12 w-12 text-muted-foreground" />
				<p className="font-semibold">Record audio directly in the app</p>
				<p className="text-sm text-muted-foreground">Click the button below to start</p>
				{/* Timer / Duration display */}
				{(state === "recording" || currentDuration > 0) && (
					<div className="mt-4">
						<div className="w-full h-16 rounded-lg bg-muted/30 overflow-hidden mb-2">
							<LiveWaveform
								active={state === "recording"}
								deviceId={defaultDeviceId}
								mode="static"
								height={64}
								barWidth={3}
								barGap={2}
								sensitivity={1.5}
							/>
						</div>
						<div className="text-2xl font-mono font-semibold tabular-nums">
							{formatDuration(state === "recording" ? duration : currentDuration)}
						</div>
					</div>
				)}
			</div>

			{/* Audio preview when stopped - Custom styled player */}
			{hasRecording && state !== "recording" && currentAudioUrl && (
				<MiniPlayer src={currentAudioUrl} duration={currentDuration} />
			)}

			{/* Recording controls - matches upload button style */}
			<div className="flex items-center gap-3">
				{state === "idle" && !hasRecording && (
					<Button onClick={startRecording} className="w-full">
						Start Recording
					</Button>
				)}

				{state === "recording" && (
					<Button onClick={stopRecording} variant="destructive" className="w-full">
						Stop Recording
					</Button>
				)}

				{hasRecording && state !== "recording" && (
					<>
						<Button
							onClick={handleUpload}
							disabled={isUploading}
							className="flex-1"
						>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									{uploadProgress}%
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Upload Recording
								</>
							)}
						</Button>
						<Button
							onClick={handleDiscard}
							disabled={isUploading}
							variant="outline"
							className="flex-1"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Discard
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
