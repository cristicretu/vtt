import * as SliderPrimitive from "@radix-ui/react-slider";
import { Volume2, VolumeX } from "lucide-react";
import { type ComponentProps, type CSSProperties, useEffect, useRef, useState } from "react";
import {
	AudioPlayerButton,
	AudioPlayerProvider,
	useAudioPlayer,
	useAudioPlayerTime,
} from "@/components/ui/audio-player";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Recording {
	id: string;
	patientId: string;
	patientName: string;
	recording: string;
	createdAt: Date;
}

interface RecordingPlayerProps {
	className?: string;
}

const STORAGE_KEY = "vtt_current_recording";
const VOLUME_STORAGE_KEY = "vtt_player_volume";

// Format time in MM:SS format
const formatTime = (seconds: number): string => {
	if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Validate audio URL
const isValidAudioUrl = (url: string): boolean => {
	if (!url || typeof url !== "string") return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

const LinePlayerProgress = ({
	className,
	...otherProps
}: Omit<ComponentProps<typeof SliderPrimitive.Root>, "min" | "max" | "value">) => {
	const player = useAudioPlayer();
	const time = useAudioPlayerTime();
	const wasPlayingRef = useRef(false);

	return (
		<SliderPrimitive.Root
			{...otherProps}
			value={[time]}
			onValueChange={(vals) => {
				player.seek(vals[0]);
				otherProps.onValueChange?.(vals);
			}}
			min={0}
			max={player.duration ?? 0}
			step={otherProps.step || 0.25}
			onPointerDown={(e) => {
				wasPlayingRef.current = player.isPlaying;
				player.pause();
				otherProps.onPointerDown?.(e);
			}}
			onPointerUp={(e) => {
				if (wasPlayingRef.current) {
					player.play();
				}
				otherProps.onPointerUp?.(e);
			}}
			className={cn("relative flex h-2 w-full touch-none select-none items-center", className)}
			disabled={
				player.duration === undefined ||
				!Number.isFinite(player.duration) ||
				Number.isNaN(player.duration)
			}
		>
			<SliderPrimitive.Track className="relative h-[2px] w-full grow overflow-hidden rounded-none bg-secondary/50">
				<SliderPrimitive.Range className="absolute h-full bg-primary" />
			</SliderPrimitive.Track>
			<SliderPrimitive.Thumb className="hidden" />
		</SliderPrimitive.Root>
	);
};

// Volume Control Component
const VolumeControl = () => {
	const player = useAudioPlayer();
	const [volume, setVolume] = useState(1);

	// Load volume from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
		if (stored) {
			try {
				const savedVolume = Number.parseFloat(stored);
				if (!Number.isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
					setVolume(savedVolume);
					if (player.ref.current) {
						player.ref.current.volume = savedVolume;
					}
				}
			} catch (error) {
				console.error("Failed to load volume from storage:", error);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	// Update audio element volume whenever it changes
	useEffect(() => {
		if (player.ref.current) {
			player.ref.current.volume = volume;
		}
	}, [volume, player.ref]);

	const handleVolumeChange = (values: number[]) => {
		const newVolume = values[0];
		setVolume(newVolume);
		try {
			localStorage.setItem(VOLUME_STORAGE_KEY, newVolume.toString());
		} catch (error) {
			console.error("Failed to save volume to storage:", error);
		}
	};

	const toggleMute = () => {
		const newVolume = volume === 0 ? 1 : 0;
		setVolume(newVolume);
		try {
			localStorage.setItem(VOLUME_STORAGE_KEY, newVolume.toString());
		} catch (error) {
			console.error("Failed to save volume to storage:", error);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={toggleMute}
				className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
				aria-label={volume === 0 ? "Unmute" : "Mute"}
			>
				{volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
			</button>
			<Slider
				value={[volume]}
				onValueChange={handleVolumeChange}
				min={0}
				max={1}
				step={0.01}
				className="w-20"
				aria-label="Volume"
			/>
		</div>
	);
};

function RecordingPlayerInternal({ className }: RecordingPlayerProps) {
	const [sidebarWidth, setSidebarWidth] = useState("16rem");
	const [error, setError] = useState<string | null>(null);
	const player = useAudioPlayer<{ recording: Recording }>();
	const time = useAudioPlayerTime();
	const { activeItem } = player;
	const currentRecording = activeItem?.data?.recording;
	const hasInitialized = useRef(false);

	// Listen to sidebar width changes
	useEffect(() => {
		const handleSidebarWidthChange = (event: CustomEvent<{ width: string }>) => {
			setSidebarWidth(event.detail.width);
		};

		// Initial load from localStorage
		const stored = localStorage.getItem("sidebar_width");
		if (stored) {
			setSidebarWidth(stored);
		}

		window.addEventListener("sidebarWidthChange", handleSidebarWidthChange as EventListener);
		return () => {
			window.removeEventListener("sidebarWidthChange", handleSidebarWidthChange as EventListener);
		};
	}, []);

	// Global function to load a new recording
	useEffect(() => {
		const loadRecording = (recording: Recording) => {
			// Reset error state
			setError(null);

			// Validate recording data
			if (!recording || !recording.id || !recording.recording) {
				const errorMsg = "Invalid recording data: missing required fields";
				console.error(errorMsg, recording);
				setError(errorMsg);
				return;
			}

			// Validate audio URL
			if (!isValidAudioUrl(recording.recording)) {
				const errorMsg = `Invalid audio URL: ${recording.recording}`;
				console.error(errorMsg);
				setError(errorMsg);
				return;
			}

			console.log("Loading recording:", {
				id: recording.id,
				name: recording.patientName,
				url: recording.recording,
			});

			// Save to localStorage when loading
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(recording));
			} catch (error) {
				console.error("Failed to save recording to storage:", error);
			}

			// Set the active item and play
			try {
				player.play({
					id: recording.id,
					src: recording.recording,
					data: { recording },
				});
			} catch (error) {
				const errorMsg = `Failed to play recording: ${error instanceof Error ? error.message : String(error)}`;
				console.error(errorMsg);
				setError(errorMsg);
			}
		};

		(window as Window & { loadRecording?: (recording: Recording) => void }).loadRecording =
			loadRecording;

		return () => {
			delete (window as Window & { loadRecording?: (recording: Recording) => void }).loadRecording;
		};
	}, [player]);

	// Load recording from localStorage on mount (only once)
	useEffect(() => {
		if (hasInitialized.current) return;
		hasInitialized.current = true;

		// TODO: Remove hardcoded test audio after testing
		const testRecording: Recording = {
			id: "test-recording",
			patientId: "test-patient",
			patientName: "Test Audio Recording",
			recording: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3",
			createdAt: new Date(),
		};

		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const recording = JSON.parse(stored);
				recording.createdAt = new Date(recording.createdAt);

				// Validate the stored recording
				if (!isValidAudioUrl(recording.recording)) {
					console.warn("Stored recording has invalid URL, using test audio");
					player.setActiveItem({
						id: testRecording.id,
						src: testRecording.recording,
						data: { recording: testRecording },
					});
					return;
				}

				console.log("Loading recording from storage:", recording);
				player.setActiveItem({
					id: recording.id,
					src: recording.recording,
					data: { recording },
				});
			} catch (error) {
				console.error("Failed to load recording from storage:", error);
				// Fallback to test audio on error
				player.setActiveItem({
					id: testRecording.id,
					src: testRecording.recording,
					data: { recording: testRecording },
				});
			}
		} else {
			// Load test audio only if nothing in localStorage
			console.log("No stored recording, loading test audio");
			player.setActiveItem({
				id: testRecording.id,
				src: testRecording.recording,
				data: { recording: testRecording },
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	// Save current recording to localStorage whenever it changes
	useEffect(() => {
		if (currentRecording && hasInitialized.current) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRecording));
			} catch (error) {
				console.error("Failed to save recording to storage:", error);
			}
		}
	}, [currentRecording]);

	// Keyboard shortcuts: Arrow keys for seeking, Spacebar for play/pause
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Check if user is typing in an input field
			const target = e.target as HTMLElement;
			const isInputField =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable;

			// Spacebar: play/pause (but not when typing in input fields)
			if (e.key === " " && !isInputField) {
				e.preventDefault();
				if (player.isPlaying) {
					player.pause();
				} else {
					player.play();
				}
				return;
			}

			// Arrow keys: skip forward/backward 5 seconds
			if (e.key === "ArrowRight") {
				e.preventDefault();
				const newTime = Math.min((time || 0) + 5, player.duration ?? 0);
				player.seek(newTime);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				const newTime = Math.max((time || 0) - 5, 0);
				player.seek(newTime);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [player, time]);

	if (!activeItem || !currentRecording) {
		return null;
	}

	return (
		<div
			className={cn(
				"fixed bottom-0 z-50 border-t bg-background/95 backdrop-blur transition-all duration-200 ease-out supports-[backdrop-filter]:bg-background/60",
				"left-0 w-full",
				"md:left-[var(--sidebar-offset)] md:w-[calc(100vw-var(--sidebar-offset))]",
				className,
			)}
			style={
				{
					"--sidebar-offset": sidebarWidth,
				} as CSSProperties
			}
		>
			{/* Error Banner */}
			{error && (
				<div className="bg-destructive/10 px-4 py-2 text-destructive text-sm">
					<span className="font-medium">Error:</span> {error}
				</div>
			)}

			<div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-4 py-3">
				{/* Play/Pause Button */}
				<AudioPlayerButton
					item={{
						id: currentRecording.id,
						src: currentRecording.recording,
						data: { recording: currentRecording },
					}}
					variant="ghost"
					size="icon"
					className="h-9 w-9 flex-shrink-0"
				/>

				{/* Patient Name and Time Display */}
				<div className="min-w-0 flex-1">
					<div className="flex flex-row items-center justify-start gap-2">
						<p className="truncate font-medium text-sm">{currentRecording.patientName}</p>
						<p className="truncate font-light text-muted-foreground text-xs">
							{currentRecording.createdAt.toDateString()}
						</p>
					</div>
					<p className="text-xs text-muted-foreground">
						{formatTime(time)} / {formatTime(player.duration ?? 0)}
					</p>
				</div>

				{/* Volume Control */}
				<VolumeControl />
			</div>

			{/* Progress Bar */}
			<LinePlayerProgress className="absolute bottom-0 w-full" />
		</div>
	);
}

export function RecordingPlayer({ className }: RecordingPlayerProps) {
	return (
		<AudioPlayerProvider>
			<RecordingPlayerInternal className={className} />
		</AudioPlayerProvider>
	);
}

// Helper function to load a recording from anywhere in the app
export function loadRecording(recording: Recording) {
	if (typeof window !== "undefined") {
		const win = window as Window & {
			loadRecording?: (recording: Recording) => void;
		};
		if (win.loadRecording) {
			win.loadRecording(recording);
		} else {
			console.error(
				"Recording player not initialized. Make sure RecordingPlayer component is mounted.",
			);
		}
	}
}
