import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ConvexReactClient } from "convex/react";
import { HelmetProvider } from "react-helmet-async";
import { router } from "@/router";
import "@/i18n";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "./components/ui/sidebar";

// Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});

convexQueryClient.connect(queryClient);

function InnerApp() {
	return (
		<ThemeProvider>
			<SidebarProvider>
				<RouterProvider router={router} context={{ queryClient }} />
			</SidebarProvider>
		</ThemeProvider>
	);
}

const helmetContext = {};

export default function App() {
	return (
		<HelmetProvider context={helmetContext}>
			<ConvexAuthProvider client={convex}>
				<QueryClientProvider client={queryClient}>
					<InnerApp />
				</QueryClientProvider>
			</ConvexAuthProvider>
		</HelmetProvider>
	);
}
