import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RecordingPlayer } from "@/routes/_app/_auth/-components/RecordingPlayer";

export const Route = createFileRoute("/_app/_auth/_layout/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	return (
		<div className="relative flex h-full w-full flex-col">
			{/* Main content area with padding for the player */}
			<div className="flex-1 overflow-auto pb-24 md:pb-20">
				<Outlet />
			</div>

			{/* Fixed Recording Player at the bottom */}
			<RecordingPlayer />
		</div>
	);
}
