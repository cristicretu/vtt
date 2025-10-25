"use client";

import {
	FileAudio,
	Pause,
	Play,
	RotateCcw,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
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
const STORAGE_VOLUME_KEY = "vtt_player_volume";

export function RecordingPlayer({ className }: RecordingPlayerProps) {
	const audioRef = React.useRef<HTMLAudioElement>(null);
	const [currentRecording, setCurrentRecording] = React.useState<Recording | null>(null);
	const [isPlaying, setIsPlaying] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [duration, setDuration] = React.useState(0);
	const [volume, setVolume] = React.useState(0.7);
	const [isMuted, setIsMuted] = React.useState(false);
	const [previousVolume, setPreviousVolume] = React.useState(0.7);

	// Load recording from localStorage on mount
	React.useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		const storedVolume = localStorage.getItem(STORAGE_VOLUME_KEY);

		if (stored) {
			try {
				const recording = JSON.parse(stored);
				// Convert date string back to Date object
				recording.createdAt = new Date(recording.createdAt);
				setCurrentRecording(recording);
			} catch (error) {
				console.error("Failed to load recording from storage:", error);
			}
		}

		if (storedVolume) {
			const vol = Number.parseFloat(storedVolume);
			setVolume(vol);
			setPreviousVolume(vol);
		}
	}, []);

	// Save recording to localStorage when it changes
	React.useEffect(() => {
		if (currentRecording) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRecording));
		}
	}, [currentRecording]);

	// Save volume to localStorage when it changes
	React.useEffect(() => {
		localStorage.setItem(STORAGE_VOLUME_KEY, volume.toString());
	}, [volume]);

	// Set up audio element event listeners
	React.useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
		const handleDurationChange = () => setDuration(audio.duration);
		const handleEnded = () => setIsPlaying(false);
		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);

		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("durationchange", handleDurationChange);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);

		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("durationchange", handleDurationChange);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
		};
	}, []);

	// Update audio volume
	React.useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = isMuted ? 0 : volume;
		}
	}, [volume, isMuted]);

	// Global function to load a new recording (can be called from other components)
	React.useEffect(() => {
		const loadRecording = (recording: Recording) => {
			setCurrentRecording(recording);
			setCurrentTime(0);
			// Auto-play when a new recording is loaded
			setTimeout(() => {
				audioRef.current?.play();
			}, 100);
		};

		// Expose function globally
		(window as Window & { loadRecording?: (recording: Recording) => void }).loadRecording =
			loadRecording;

		return () => {
			delete (window as Window & { loadRecording?: (recording: Recording) => void }).loadRecording;
		};
	}, []);

	const togglePlayPause = () => {
		if (!audioRef.current || !currentRecording) return;

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
	};

	const handleReset = () => {
		if (!audioRef.current) return;
		audioRef.current.currentTime = 0;
		setCurrentTime(0);
	};

	const handleSeek = (value: number[]) => {
		if (!audioRef.current) return;
		const newTime = value[0];
		audioRef.current.currentTime = newTime;
		setCurrentTime(newTime);
	};

	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0];
		setVolume(newVolume);
		if (newVolume > 0 && isMuted) {
			setIsMuted(false);
		}
	};

	const toggleMute = () => {
		if (isMuted) {
			setIsMuted(false);
			setVolume(previousVolume);
		} else {
			setPreviousVolume(volume);
			setIsMuted(true);
		}
	};

	const skipForward = () => {
		if (!audioRef.current) return;
		audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
	};

	const skipBackward = () => {
		if (!audioRef.current) return;
		audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
	};

	const formatTime = (time: number) => {
		if (Number.isNaN(time)) return "0:00";
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div
			className={cn(
				"relative right-0 bottom-0 left-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
				className,
			)}
		>
			{currentRecording && (
				<audio ref={audioRef} src={currentRecording.recording} preload="metadata" />
			)}

			<div className="mx-auto max-w-screen-2xl px-4 py-3">
				{/* Mobile Layout */}
				<div className="flex flex-col gap-3 md:hidden">
					{/* Recording Info */}
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-lime-400 via-cyan-300 to-blue-500">
							<FileAudio className="h-6 w-6 text-white" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-sm">
								{currentRecording?.patientName || "No recording selected"}
							</p>
							<p className="truncate text-muted-foreground text-xs">
								{currentRecording?.createdAt.toLocaleDateString() || "Select a recording to play"}
							</p>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-xs tabular-nums">
							{formatTime(currentTime)}
						</span>
						<Slider
							value={[currentTime]}
							min={0}
							max={duration || 100}
							step={0.1}
							onValueChange={handleSeek}
							className="flex-1"
							disabled={!currentRecording}
						/>
						<span className="text-muted-foreground text-xs tabular-nums">
							{formatTime(duration)}
						</span>
					</div>

					{/* Controls */}
					<div className="flex items-center justify-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={handleReset}
							disabled={!currentRecording}
						>
							<RotateCcw className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={skipBackward}
							disabled={!currentRecording}
						>
							<SkipBack className="h-4 w-4" />
						</Button>
						<Button
							variant="default"
							size="icon"
							className="h-10 w-10"
							onClick={togglePlayPause}
							disabled={!currentRecording}
						>
							{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={skipForward}
							disabled={!currentRecording}
						>
							<SkipForward className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={toggleMute}
							disabled={!currentRecording}
						>
							{isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
						</Button>
					</div>
				</div>

				{/* Desktop Layout */}
				<div className="hidden items-center gap-6 md:flex">
					{/* Left: Recording Info */}
					<div className="flex w-[300px] items-center gap-3">
						<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-lime-400 via-cyan-300 to-blue-500">
							<FileAudio className="h-6 w-6 text-white" />
						</div>
						<div className="min-w-0">
							<p className="truncate font-medium text-sm">
								{currentRecording?.patientName || "No recording selected"}
							</p>
							<p className="truncate text-muted-foreground text-xs">
								{currentRecording
									? currentRecording.createdAt.toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})
									: "Select a recording to play"}
							</p>
						</div>
					</div>

					{/* Center: Controls and Progress */}
					<div className="flex flex-1 flex-col gap-2">
						{/* Playback Controls */}
						<div className="flex items-center justify-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={handleReset}
								disabled={!currentRecording}
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={skipBackward}
								disabled={!currentRecording}
							>
								<SkipBack className="h-4 w-4" />
							</Button>
							<Button
								variant="default"
								size="icon"
								className="h-10 w-10"
								onClick={togglePlayPause}
								disabled={!currentRecording}
							>
								{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={skipForward}
								disabled={!currentRecording}
							>
								<SkipForward className="h-4 w-4" />
							</Button>
						</div>

						{/* Progress Bar */}
						<div className="flex items-center gap-3">
							<span className="text-muted-foreground text-xs tabular-nums">
								{formatTime(currentTime)}
							</span>
							<Slider
								value={[currentTime]}
								min={0}
								max={duration || 100}
								step={0.1}
								onValueChange={handleSeek}
								className="flex-1"
								disabled={!currentRecording}
							/>
							<span className="text-muted-foreground text-xs tabular-nums">
								{formatTime(duration)}
							</span>
						</div>
					</div>

					{/* Right: Volume Control */}
					<div className="flex w-[180px] items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={toggleMute}
							disabled={!currentRecording}
						>
							{isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
						</Button>
						<Slider
							value={[isMuted ? 0 : volume]}
							min={0}
							max={1}
							step={0.01}
							onValueChange={handleVolumeChange}
							className="flex-1"
							disabled={!currentRecording}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper function to load a recording from anywhere in the app
export function loadRecording(recording: Recording) {
	if (typeof window !== "undefined") {
		const win = window as Window & { loadRecording?: (recording: Recording) => void };
		if (win.loadRecording) {
			win.loadRecording(recording);
		}
	}
}
