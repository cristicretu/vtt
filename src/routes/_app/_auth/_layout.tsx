import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./-components/app-sidebar";

export const Route = createFileRoute("/_app/_auth/_layout")({
	component: Layout,
});

function Layout() {
	const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
	if (!user) {
		return null;
	}
	return (
		<SidebarProvider defaultOpen={true}>
			<AppSidebar user={user} />
			<SidebarInset>
				<div className="flex h-full w-full">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
