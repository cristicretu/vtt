import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Doc } from "~/convex/_generated/dataModel";

interface MediaPlayerProps {
	recording: Doc<"diagnosisDocuments"> & { fileUrl: string | null };
	onClose: () => void;
}

export function MediaPlayer({ recording, onClose }: MediaPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (audioRef.current && recording.fileUrl) {
			audioRef.current.src = recording.fileUrl;
			audioRef.current.play().catch((e) => console.error("Autoplay was prevented:", e));
		}
	}, [recording]);

	return (
		<div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg z-50">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
				<div className="flex items-center gap-4 min-w-0">
					<div className="min-w-0">
						<p className="font-semibold truncate">
							Playing: Recording from{" "}
							{new Date(recording.dateCreated).toLocaleDateString("en-US", {
								year: "numeric",
								month: "short",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
						<p className="text-sm text-muted-foreground truncate">
							Patient ID: {recording.patientId}
						</p>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center gap-4 max-w-2xl">
					<audio ref={audioRef} controls className="w-full" />
				</div>
				<Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
					<X className="h-5 w-5" />
				</Button>
			</div>
		</div>
	);
}
