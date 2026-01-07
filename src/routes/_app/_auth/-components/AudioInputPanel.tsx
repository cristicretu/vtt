import { RecordingUpload } from "./RecordingUpload";
import { AudioRecorder } from "./AudioRecorder";
import type { Id } from "~/convex/_generated/dataModel";

interface AudioInputPanelProps {
	patientId: Id<"patients">;
}

/**
 * Split panel for audio input: upload on left, record on right
 * With "or" divider to show they are alternatives
 * Both sides stretch to match heights
 */
export function AudioInputPanel({ patientId }: AudioInputPanelProps) {
	return (
		<div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] items-stretch">
			{/* Upload Section */}
			<div className="flex flex-col">
				<RecordingUpload patientId={patientId} />
			</div>

			{/* Divider - visible on all screen sizes */}
			<div className="flex md:flex-col items-center gap-4">
				<div className="flex-1 border-t md:border-t-0 md:border-l" />
				<span className="text-xs text-muted-foreground uppercase font-medium px-2">or</span>
				<div className="flex-1 border-t md:border-t-0 md:border-l" />
			</div>

			{/* Record Section */}
			<div className="flex flex-col">
				<AudioRecorder patientId={patientId} />
			</div>
		</div>
	);
}

