import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "~/convex/_generated/api";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import * as validators from "@/utils/validators";
import { useEffect, useState } from "react";
import { getLocaleCurrency } from "@/utils/misc";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_app/_auth/onboarding/_layout/username")(
	{
		component: OnboardingUsername,
		beforeLoad: () => ({
			title: `Username`,
		}),
	},
);

export default function OnboardingUsername() {
	const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mutateAsync: completeOnboarding } = useMutation({
		mutationFn: useConvexMutation(api.app.completeOnboarding),
	});
	const navigate = useNavigate();

	const form = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			username: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			await completeOnboarding({
				username: value.username,
				currency: getLocaleCurrency(),
			});
			setIsSubmitting(false);
		},
	});

	useEffect(() => {
		if (user?.username) {
			navigate({ to: DashboardRoute.fullPath });
		}
	}, [user?.username]);

	return (
		<div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-6 p-6">
			<Card className="w-full border-border/50 shadow-lg">
				<CardHeader className="space-y-3 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<User className="h-8 w-8 text-primary" />
					</div>
					<CardTitle className="text-2xl font-semibold tracking-tight">
						Choose your username
					</CardTitle>
					<CardDescription>
						This is how you'll appear to others on the platform
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="flex w-full flex-col gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className="space-y-2">
							<form.Field
								name="username"
								validators={{
									onSubmit: validators.username,
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Input
											id="username"
											type="text"
											placeholder="johndoe"
											autoComplete="off"
											required
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className={`${
												field.state.meta?.errors.length > 0 &&
												"border-destructive focus-visible:ring-destructive"
											}`}
										/>
										{field.state.meta?.errors.length > 0 && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors.join(" ")}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</div>

						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating account...
								</>
							) : (
								"Continue"
							)}
						</Button>
					</form>

					<p className="mt-4 text-center text-xs text-muted-foreground">
						You can change your username anytime from your account settings
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
