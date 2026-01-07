import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "recording" | "stopped";

interface UseAudioRecorderOptions {
	deviceId?: string;
	onError?: (error: Error) => void;
}

interface UseAudioRecorderReturn {
	state: RecordingState;
	duration: number;
	audioBlob: Blob | null;
	audioUrl: string | null;
	mimeType: string;
	isSupported: boolean;
	startRecording: () => Promise<void>;
	stopRecording: () => void;
	clearRecording: () => void;
	stream: MediaStream | null;
}

/**
 * Get the best supported audio MIME type for recording
 * Prefers Opus/WebM for quality/size, falls back to AAC/MP4 for Safari
 */
function getSupportedMimeType(): string {
	const types = [
		"audio/webm;codecs=opus",
		"audio/webm",
		"audio/mp4",
		"audio/ogg;codecs=opus",
		"audio/ogg",
	];

	for (const type of types) {
		if (MediaRecorder.isTypeSupported(type)) {
			return type;
		}
	}

	return "audio/webm"; // Fallback, most browsers support this
}

/**
 * Hook for recording audio from the microphone
 */
export function useAudioRecorder({
	deviceId,
	onError,
}: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
	const [state, setState] = useState<RecordingState>("idle");
	const [duration, setDuration] = useState(0);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<number | null>(null);
	const startTimeRef = useRef<number>(0);

	const mimeType = getSupportedMimeType();
	const isSupported = typeof MediaRecorder !== "undefined";

	// Cleanup audio URL on unmount or when creating a new one
	useEffect(() => {
		return () => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
		};
	}, [audioUrl]);

	// Cleanup stream on unmount
	useEffect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, [stream]);

	const startRecording = useCallback(async () => {
		if (!isSupported) {
			onError?.(new Error("MediaRecorder is not supported in this browser"));
			return;
		}

		try {
			// Clear any previous recording
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
			setAudioBlob(null);
			setAudioUrl(null);
			chunksRef.current = [];

			// Get microphone access
			const constraints: MediaStreamConstraints = {
				audio: deviceId
					? {
							deviceId: { exact: deviceId },
							echoCancellation: true,
							noiseSuppression: true,
							autoGainControl: true,
						}
					: {
							echoCancellation: true,
							noiseSuppression: true,
							autoGainControl: true,
						},
			};

			const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
			setStream(mediaStream);

			// Create MediaRecorder with optimal settings for speech
			const recorder = new MediaRecorder(mediaStream, {
				mimeType,
				audioBitsPerSecond: 32000, // 32kbps is great for speech
			});

			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunksRef.current.push(event.data);
				}
			};

			recorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: mimeType });
				const url = URL.createObjectURL(blob);
				setAudioBlob(blob);
				setAudioUrl(url);
				setState("stopped");

				// Stop the stream tracks
				mediaStream.getTracks().forEach((track) => track.stop());
				setStream(null);

				// Clear timer
				if (timerRef.current) {
					cancelAnimationFrame(timerRef.current);
					timerRef.current = null;
				}
			};

			recorder.onerror = (event) => {
				onError?.(new Error(`Recording error: ${event}`));
				setState("idle");
			};

			mediaRecorderRef.current = recorder;

			// Start recording
			recorder.start(1000); // Collect data every second
			setState("recording");
			startTimeRef.current = Date.now();
			setDuration(0);

			// Start duration timer
			const updateDuration = () => {
				if (mediaRecorderRef.current?.state === "recording") {
					setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
					timerRef.current = requestAnimationFrame(updateDuration);
				}
			};
			timerRef.current = requestAnimationFrame(updateDuration);
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Failed to start recording");
			onError?.(err);
			setState("idle");
		}
	}, [deviceId, isSupported, mimeType, onError, audioUrl]);

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
			mediaRecorderRef.current.stop();
		}

		if (timerRef.current) {
			cancelAnimationFrame(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const clearRecording = useCallback(() => {
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}

		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
		}

		if (timerRef.current) {
			cancelAnimationFrame(timerRef.current);
			timerRef.current = null;
		}

		setAudioBlob(null);
		setAudioUrl(null);
		setStream(null);
		setDuration(0);
		setState("idle");
		chunksRef.current = [];
		mediaRecorderRef.current = null;
	}, [audioUrl, stream]);

	return {
		state,
		duration,
		audioBlob,
		audioUrl,
		mimeType,
		isSupported,
		startRecording,
		stopRecording,
		clearRecording,
		stream,
	};
}
