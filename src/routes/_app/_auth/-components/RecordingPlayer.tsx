"use client";

import {
  ChevronLeft,
  ChevronRight,
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
const STORAGE_MUTED_KEY = "vtt_player_muted";

export function RecordingPlayer({ className }: RecordingPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [currentRecording, setCurrentRecording] =
    React.useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  // Initialize volume from localStorage or default to 0.7
  const [volume, setVolume] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_VOLUME_KEY);
      if (stored) {
        return Number.parseFloat(stored);
      }
    }
    return 0.7;
  });
  // Initialize mute state from localStorage
  const [isMuted, setIsMuted] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_MUTED_KEY);
      return stored === "true";
    }
    return false;
  });
  const [previousVolume, setPreviousVolume] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_VOLUME_KEY);
      if (stored) {
        return Number.parseFloat(stored);
      }
    }
    return 0.7;
  });
  const [sidebarWidth, setSidebarWidth] = React.useState("16rem");

  // Listen to sidebar width changes
  React.useEffect(() => {
    const handleSidebarWidthChange = (
      event: CustomEvent<{ width: string }>
    ) => {
      setSidebarWidth(event.detail.width);
    };

    // Initial load from localStorage
    const stored = localStorage.getItem("sidebar_width");
    if (stored) {
      setSidebarWidth(stored);
    }

    window.addEventListener(
      "sidebarWidthChange",
      handleSidebarWidthChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "sidebarWidthChange",
        handleSidebarWidthChange as EventListener
      );
    };
  }, []);

  // Load recording from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

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

  // Save mute state to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem(STORAGE_MUTED_KEY, isMuted.toString());
  }, [isMuted]);

  // Set up audio element event listeners
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume immediately
    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(0);
      // Ensure volume is set when metadata loads
      audio.volume = isMuted ? 0 : volume;
    };

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
  }, [currentRecording, volume, isMuted]);

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
    (
      window as Window & { loadRecording?: (recording: Recording) => void }
    ).loadRecording = loadRecording;

    return () => {
      delete (
        window as Window & { loadRecording?: (recording: Recording) => void }
      ).loadRecording;
    };
  }, []);

  // Expose togglePlayPause globally
  React.useEffect(() => {
    (window as any).togglePlayPause = togglePlayPause;
    return () => {
      delete (window as any).togglePlayPause;
    };
  }, [isPlaying, currentRecording]);

  // Broadcast playing state changes
  React.useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("playingStateChanged", { detail: { isPlaying } })
    );
  }, [isPlaying]);

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

  const skip10Forward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.currentTime + 10,
      duration
    );
  };

  const skip10Backward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      audioRef.current.currentTime - 10,
      0
    );
  };

  const nextRecording = () => {
    const win = window as any;
    if (win.nextRecording) {
      win.nextRecording();
    }
  };

  const previousRecording = () => {
    const win = window as any;
    if (win.previousRecording) {
      win.previousRecording();
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if user is interacting with form elements or editable content
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLButtonElement ||
        target.isContentEditable ||
        target.closest('button') || // Check if target is inside a button
        target.closest('select')    // Check if target is inside a select
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          skip10Backward();
          break;
        case "ArrowRight":
          e.preventDefault();
          skip10Forward();
          break;
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [duration, isPlaying, currentRecording]);

  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 z-50 border-t bg-background/95 backdrop-blur transition-all duration-200 ease-out supports-[backdrop-filter]:bg-background/60",
        // On mobile, full width from left
        "left-0 w-full",
        // On desktop, offset by sidebar width
        "md:left-[var(--sidebar-offset)] md:w-[calc(100vw-var(--sidebar-offset))]",
        className
      )}
      style={
        {
          "--sidebar-offset": sidebarWidth,
        } as React.CSSProperties
      }
    >
      {currentRecording && (
        <audio
          ref={audioRef}
          src={currentRecording.recording}
          preload="metadata"
        />
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
                {currentRecording?.createdAt.toLocaleDateString() ||
                  "Select a recording to play"}
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
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={skip10Backward}
              disabled={!currentRecording}
              title="Back 10s (←)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={previousRecording}
              disabled={!currentRecording}
              title="Previous recording"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-10 w-10"
              onClick={togglePlayPause}
              disabled={!currentRecording}
              title="Play/Pause (Space)"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={nextRecording}
              disabled={!currentRecording}
              title="Next recording"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={skip10Forward}
              disabled={!currentRecording}
              title="Forward 10s (→)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
              disabled={!currentRecording}
              title="Mute"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
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
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={skip10Backward}
                disabled={!currentRecording}
                title="Back 10s (←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={previousRecording}
                disabled={!currentRecording}
                title="Previous recording"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10"
                onClick={togglePlayPause}
                disabled={!currentRecording}
                title="Play/Pause (Space)"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={nextRecording}
                disabled={!currentRecording}
                title="Next recording"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={skip10Forward}
                disabled={!currentRecording}
                title="Forward 10s (→)"
              >
                <ChevronRight className="h-4 w-4" />
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
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
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
    const win = window as Window & {
      loadRecording?: (recording: Recording) => void;
    };
    if (win.loadRecording) {
      win.loadRecording(recording);
    }
  }
}
