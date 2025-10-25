import { useConvexAuth } from "@convex-dev/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mic } from "lucide-react";
import { Route as DashboardRoute } from "@/routes/_app/_auth/_layout/dashboard/index";
import { Route as AuthLoginRoute } from "@/routes/_app/login/_layout.index";
import siteConfig from "~/site.config";
import { Logo } from "../components/ui/logo";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { isLoading, isAuthenticated } = useConvexAuth();

	return (
		<div className="relative flex min-h-screen w-full flex-col bg-background">
			{/* Navigation */}
			<nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<Link to="/" className="flex items-center gap-2">
						<Logo />
					</Link>
					<Link
						to={isAuthenticated ? DashboardRoute.fullPath : AuthLoginRoute.fullPath}
						disabled={isLoading}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{!isLoading && (isAuthenticated ? "Dashboard" : "Get Started")}
					</Link>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
				<div className="mx-auto max-w-3xl text-center">
					<div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
						<Mic className="h-8 w-8 text-primary" />
					</div>

					<h1 className="mb-6 font-bold text-5xl tracking-tight md:text-6xl">
						{siteConfig.siteTitle}
					</h1>

					<p className="mb-8 text-lg text-muted-foreground md:text-xl">
						{siteConfig.siteDescription}
					</p>

					<Link to={AuthLoginRoute.fullPath}>Start Transcribing</Link>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t py-6">
				<div className="mx-auto max-w-7xl px-6 text-center text-muted-foreground text-sm">
					Powered by OpenAI Whisper
				</div>
			</footer>
		</div>
	);
}
