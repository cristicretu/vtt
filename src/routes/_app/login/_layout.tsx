import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { Logo } from "@/components/ui/logo";

const HOME_PATH = "/";

const QUOTES = [
	{
		quote: "There is nothing impossible to they who will try.",
		author: "Alexander the Great",
	},
	{
		quote: "The only way to do great work is to love what you do.",
		author: "Steve Jobs",
	},
	{
		quote: "The best way to predict the future is to create it.",
		author: "Peter Drucker",
	},
	{
		quote: "The only limit to our realization of tomorrow will be our doubts of today.",
		author: "Franklin D. Roosevelt",
	},
	{
		quote: "The only thing we have to fear is fear itself.",
		author: "Franklin D. Roosevelt",
	},
];

const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

export const Route = createFileRoute("/_app/login/_layout")({
	component: LoginLayout,
});

function LoginLayout() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	if (isLoading && !isAuthenticated) {
		return null;
	}
	return (
		<div className="flex h-screen w-full">
			{/* Mobile Logo */}
			<div className="-translate-x-1/2 absolute top-10 left-1/2 z-10 mx-auto flex transform lg:hidden">
				<Link to={HOME_PATH} className="flex h-10 flex-col items-center justify-center gap-2">
					<Logo />
				</Link>
			</div>

			{/* Left Panel - Quote Section */}
			<div className="relative hidden h-full w-[50%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/5 via-card to-card p-10 lg:flex">
				<Link to={HOME_PATH} className="z-10 flex h-10 items-center gap-2">
					<Logo />
				</Link>

				<div className="z-10 flex flex-col items-start gap-4">
					<blockquote className="border-primary border-l-4 pl-4">
						<p className="font-normal text-lg text-primary italic">"{randomQuote.quote}"</p>
						<footer className="mt-2 font-medium text-base text-primary/60">
							— {randomQuote.author}
						</footer>
					</blockquote>
				</div>

				{/* Background Pattern */}
				<div className="base-grid absolute top-0 left-0 z-0 h-full w-full opacity-40" />
				<div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
			</div>

			{/* Right Panel - Content */}
			<div className="flex h-full w-full flex-col border-primary/10 border-l bg-card lg:w-[50%]">
				<Outlet />
			</div>
		</div>
	);
}
