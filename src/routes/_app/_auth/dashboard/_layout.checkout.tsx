import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, BadgeCheck, AlertTriangle, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import siteConfig from "~/site.config";
import { PLANS } from "@cvx/schema";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/checkout")({
	component: DashboardCheckout,
	beforeLoad: () => ({
		title: `${siteConfig.siteTitle} - Checkout`,
	}),
});

export default function DashboardCheckout() {
	const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
	const isFreePlan = user?.subscription?.planKey === PLANS.FREE;
	const [isPending, setIsPending] = useState(false);

	useEffect(() => {
		if (isFreePlan) {
			setIsPending(true);
		}
		const timeoutId = setTimeout(() => {
			setIsPending(false);
		}, 8000);
		return () => clearTimeout(timeoutId);
	}, [isFreePlan]);

	if (!user) {
		return null;
	}

	const getStatusIcon = () => {
		if (isFreePlan && isPending) {
			return <Loader2 className="h-12 w-12 animate-spin text-primary/60" />;
		}
		if (!isFreePlan) {
			return <BadgeCheck className="h-12 w-12 text-green-500" />;
		}
		return <AlertTriangle className="h-12 w-12 text-destructive" />;
	};

	const getStatusMessage = () => {
		if (isFreePlan && isPending) return "Processing your payment...";
		if (!isFreePlan) return "Payment Successful!";
		return "Payment Failed";
	};

	const getStatusDescription = () => {
		if (isFreePlan && isPending)
			return "Please wait while we complete your checkout";
		if (!isFreePlan) return "Your subscription has been activated successfully";
		return "Something went wrong with your payment. Please try again.";
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-secondary p-6 dark:bg-black">
			<Card className="w-full max-w-lg border-border/50 shadow-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Checkout Status</CardTitle>
					<CardDescription>
						Processing your subscription payment
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center gap-6 py-8">
						<div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
							{getStatusIcon()}
						</div>

						<div className="text-center">
							<h3 className="mb-2 text-xl font-semibold text-primary">
								{getStatusMessage()}
							</h3>
							<p className="text-muted-foreground">{getStatusDescription()}</p>
						</div>

						<Button asChild className="w-full max-w-xs">
							<Link to={DashboardRoute.fullPath}>
								<Home className="mr-2 h-4 w-4" />
								Return to Dashboard
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Background Pattern */}
			<div className="base-grid fixed inset-0 -z-10 opacity-40" />
			<div className="fixed inset-0 -z-10 bg-gradient-to-t from-card via-transparent to-transparent" />
		</div>
	);
}
