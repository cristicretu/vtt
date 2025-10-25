import { useAuthActions } from "@convex-dev/auth/react";
import { convexQuery, useConvexAuth } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Route as DashboardRoute } from "@/routes/_app/_auth/_layout/dashboard.index";

export const Route = createFileRoute("/_app/login/_layout/")({
	component: Login,
});

function Login() {
	const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
	const { isAuthenticated, isLoading } = useConvexAuth();
	const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
	const navigate = useNavigate();
	useEffect(() => {
		if ((isLoading && !isAuthenticated) || !user) {
			return;
		}
		if (!isLoading && isAuthenticated) {
			navigate({ to: DashboardRoute.fullPath });
			return;
		}
	}, [user]);

	if (step === "signIn") {
		return <LoginForm onSubmit={(email) => setStep({ email })} />;
	}
	return <VerifyForm email={step.email} />;
}

function LoginForm({ onSubmit }: { onSubmit: (email: string) => void }) {
	const { signIn } = useAuthActions();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			await signIn("resend-otp", value);
			onSubmit(value.email);
			setIsSubmitting(false);
		},
	});

	return (
		<div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-6 p-6">
			<Card className="w-full border-border/50 shadow-lg">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="font-semibold text-2xl tracking-tight">Welcome back</CardTitle>
					<CardDescription>Sign in to your account to continue</CardDescription>
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
								name="email"
								validators={{
									onSubmit: z.string().max(256).email("Email address is not valid."),
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Input
											id="email"
											type="email"
											placeholder="name@example.com"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className={`${
												field.state.meta?.errors.length > 0 &&
												"border-destructive focus-visible:ring-destructive"
											}`}
										/>
										{field.state.meta?.errors.length > 0 && (
											<p className="text-destructive text-sm">
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
									Sending code...
								</>
							) : (
								<>
									<Mail className="mr-2 h-4 w-4" />
									Continue with Email
								</>
							)}
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<Separator />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">Or continue with</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => signIn("google", { redirectTo: "/login" })}
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.1,5.5 15.71,6.15L17.82,4.21C16.32,2.88 14.47,2 12.19,2C6.92,2 2.71,6.62 2.71,12C2.71,17.38 6.92,22 12.19,22C17.6,22 21.54,18.33 21.54,12.29C21.54,11.76 21.45,11.43 21.35,11.1Z"
								/>
							</svg>
							Continue with Google
						</Button>
					</form>

					<p className="mt-4 px-8 text-center text-muted-foreground text-xs leading-normal">
						By clicking continue, you agree to our{" "}
						<a href="#" className="underline underline-offset-4 hover:text-primary">
							Terms of Service
						</a>{" "}
						and{" "}
						<a href="#" className="underline underline-offset-4 hover:text-primary">
							Privacy Policy
						</a>
						.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

function VerifyForm({ email }: { email: string }) {
	const { signIn } = useAuthActions();
	const form = useForm({
		validatorAdapter: zodValidator(),
		defaultValues: {
			code: "",
		},
		onSubmit: async ({ value }) => {
			await signIn("resend-otp", { email, code: value.code });
		},
	});

	return (
		<div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-6 p-6">
			<Card className="w-full border-border/50 shadow-lg">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="font-semibold text-2xl tracking-tight">Check your inbox</CardTitle>
					<CardDescription className="text-balance">
						We've sent a verification code to{" "}
						<span className="font-medium text-primary">{email}</span>
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
								name="code"
								validators={{
									onSubmit: z.string().min(8, "Code must be at least 8 characters."),
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Input
											id="code"
											type="text"
											placeholder="Enter verification code"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className={`font-mono ${
												field.state.meta?.errors.length > 0 &&
												"border-destructive focus-visible:ring-destructive"
											}`}
										/>
										{field.state.meta?.errors.length > 0 && (
											<p className="text-destructive text-sm">
												{field.state.meta.errors.join(" ")}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</div>

						<Button type="submit" className="w-full">
							Verify and Continue
						</Button>
					</form>

					<Separator className="my-4" />

					<div className="text-center">
						<p className="mb-2 text-muted-foreground text-sm">Didn't receive the code?</p>
						<Button variant="ghost" size="sm" onClick={() => signIn("resend-otp", { email })}>
							Resend Code
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
