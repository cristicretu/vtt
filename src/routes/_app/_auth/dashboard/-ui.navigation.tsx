import { Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignOut } from "@/utils/misc";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-util";
import { Logo } from "@/components/ui/logo";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import { Route as SettingsRoute } from "@/routes/_app/_auth/dashboard/_layout.settings.index";
import type { User } from "~/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation({ user }: { user: User }) {
	const signOut = useSignOut();
	const matchRoute = useMatchRoute();
	const navigate = useNavigate();
	const isDashboardPath = matchRoute({ to: DashboardRoute.fullPath });
	const isSettingsPath = matchRoute({ to: SettingsRoute.fullPath });

	if (!user) {
		return null;
	}

	return (
		<nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-6 py-3">
				<div className="flex h-10 items-center gap-2">
					<Link
						to={DashboardRoute.fullPath}
						className="flex h-10 items-center gap-2 transition-opacity hover:opacity-80"
					>
						<Logo />
					</Link>
				</div>

				<div className="flex h-10 items-center gap-3">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative h-9 w-9 rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<Avatar className="h-9 w-9">
									<AvatarImage
										src={user.avatarUrl}
										alt={user.username ?? user.email}
									/>
									<AvatarFallback className="bg-gradient-to-br from-lime-400 via-cyan-300 to-blue-500 text-sm font-medium text-white">
										{user.username?.charAt(0).toUpperCase() ??
											user.email?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							sideOffset={8}
							className="w-56"
							align="end"
							forceMount
						>
							<div className="flex items-center justify-start gap-2 p-2">
								<div className="flex flex-col space-y-1 leading-none">
									{user.username && (
										<p className="font-medium">{user.username}</p>
									)}
									<p className="w-[200px] truncate text-sm text-muted-foreground">
										{user.email}
									</p>
								</div>
							</div>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								className="cursor-pointer"
								onClick={() => navigate({ to: SettingsRoute.fullPath })}
							>
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</DropdownMenuItem>

							<DropdownMenuItem className="cursor-pointer hover:bg-transparent focus:bg-transparent">
								<ThemeSwitcher />
							</DropdownMenuItem>

							<DropdownMenuItem className="cursor-pointer hover:bg-transparent focus:bg-transparent">
								<LanguageSwitcher />
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem className="cursor-pointer" onClick={signOut}>
								<LogOut className="mr-2 h-4 w-4" />
								Log Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="mx-auto flex w-full max-w-screen-xl items-center gap-1 px-6">
				<Link
					to={DashboardRoute.fullPath}
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						"relative rounded-none border-b-2 border-transparent px-4 py-6 hover:bg-transparent",
						isDashboardPath &&
							"border-primary font-medium text-primary hover:text-primary",
					)}
				>
					Dashboard
				</Link>
				<Link
					to={SettingsRoute.fullPath}
					className={cn(
						buttonVariants({ variant: "ghost", size: "sm" }),
						"relative rounded-none border-b-2 border-transparent px-4 py-6 hover:bg-transparent",
						isSettingsPath &&
							"border-primary font-medium text-primary hover:text-primary",
					)}
				>
					Settings
				</Link>
			</div>
		</nav>
	);
}
