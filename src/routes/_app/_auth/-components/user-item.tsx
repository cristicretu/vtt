"use client";
import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/lib/utils";
import { Route as SettingsRoute } from "@/routes/_app/_auth/_layout/settings";
import type { User } from "~/types";

const UserItem = ({ user }: { user: User }) => {
	const signOut = useSignOut();
	const navigate = useNavigate();

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-auto items-center justify-start gap-2 px-2 py-1.5 hover:bg-accent"
				>
					<Avatar className="h-8 w-8 shrink-0">
						<AvatarImage src={user.avatarUrl} alt={user.username ?? user.email} />
						<AvatarFallback className="bg-gradient-to-br from-lime-400 via-cyan-300 to-blue-500 font-medium text-sm text-white">
							{user.username?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="flex-1 font-medium text-sm">{user.username ?? "User"}</span>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="bottom" align="center">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm">Premium Plan</p>
						<p className="truncate text-muted-foreground text-xs">{user.email}</p>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() => navigate({ to: SettingsRoute.fullPath })}
				>
					<Settings className="mr-2 h-4 w-4" />
					Settings
				</DropdownMenuItem>

				<DropdownMenuItem
					className="cursor-pointer text-destructive focus:text-destructive"
					onClick={signOut}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Log Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserItem;
