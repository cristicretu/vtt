import { createFileRoute } from "@tanstack/react-router";
import { Plus, ExternalLink, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import siteConfig from "~/site.config";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/")({
	component: Dashboard,
	beforeLoad: () => ({
		title: `${siteConfig.siteTitle} - Dashboard`,
		headerTitle: "Dashboard",
		headerDescription: "Manage your Apps and view your usage.",
	}),
});

export default function Dashboard() {
	const { t } = useTranslation();

	return (
		<div className="flex min-h-screen w-full bg-secondary px-6 py-8 dark:bg-black">
			<div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-6">
				<Card className="w-full border-border/50 shadow-sm">
					<CardHeader>
						<CardTitle className="text-2xl">Get Started</CardTitle>
						<CardDescription>
							Explore the Dashboard and get started with your first app
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 via-card to-card p-12">
							{/* Content */}
							<div className="z-10 flex max-w-md flex-col items-center gap-6 text-center">
								<div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/20 bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
									<Plus className="h-10 w-10 text-primary/60" />
								</div>

								<div className="flex flex-col items-center gap-3">
									<h3 className="text-xl font-semibold text-primary">
										{t("title")}
									</h3>
									<p className="text-base text-muted-foreground">
										{t("description")}
									</p>
									<Badge variant="secondary" className="mt-2">
										💡 TIP: Try changing the language!
									</Badge>
								</div>

								<Button asChild variant="outline" className="gap-2">
									<a
										target="_blank"
										rel="noreferrer"
										href="https://github.com/get-convex/convex-saas/tree/main/docs"
									>
										<BookOpen className="h-4 w-4" />
										<span>Explore Documentation</span>
										<ExternalLink className="h-4 w-4" />
									</a>
								</Button>
							</div>

							{/* Background Effects */}
							<div className="base-grid absolute inset-0 opacity-40" />
							<div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
