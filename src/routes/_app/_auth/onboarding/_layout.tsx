import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Logo } from "@/components/ui/logo";

export const Route = createFileRoute("/_app/_auth/onboarding/_layout")({
	component: OnboardingLayout,
});

export default function OnboardingLayout() {
	return (
		<div className="relative flex min-h-screen w-full bg-gradient-to-br from-card via-primary/5 to-card">
			{/* Logo */}
			<div className="absolute left-1/2 top-8 mx-auto -translate-x-1/2 transform justify-center">
				<Logo />
			</div>

			{/* Content */}
			<div className="z-10 h-screen w-screen">
				<Outlet />
			</div>

			{/* Background Pattern */}
			<div className="base-grid fixed h-screen w-screen opacity-40" />
			<div className="fixed inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
		</div>
	);
}
