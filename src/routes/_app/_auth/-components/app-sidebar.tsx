import { Link, useRouterState } from "@tanstack/react-router";
import {
	AudioLinesIcon,
	ChevronsLeft,
	CircleUserRoundIcon,
	FileUpIcon,
	Home,
	Plus,
	Search,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { User } from "~/types";
import { patientsData } from "~/types";
import UserItem from "./user-item";

interface AppSidebarProps {
	user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
	const { toggleSidebar, state, isMobile, openMobile } = useSidebar();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const [isSearching, setIsSearching] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Determine if trigger should be shown
	const shouldShowTrigger = isMobile ? !openMobile : state === "collapsed";

	// Focus input when search mode is activated
	useEffect(() => {
		if (isSearching && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isSearching]);

	// Fuzzy search filter
	const filteredPatients = useMemo(() => {
		if (!searchQuery.trim()) {
			return patientsData;
		}

		const query = searchQuery.toLowerCase();
		return patientsData.filter((patient) => {
			const name = patient.fullName.toLowerCase();
			// Simple fuzzy matching: check if all characters in query appear in order
			let queryIndex = 0;
			for (let i = 0; i < name.length && queryIndex < query.length; i++) {
				if (name[i] === query[queryIndex]) {
					queryIndex++;
				}
			}
			return queryIndex === query.length;
		});
	}, [searchQuery]);

	const handleSearchClick = () => {
		setIsSearching(true);
	};

	const handleSearchClose = () => {
		setIsSearching(false);
		setSearchQuery("");
	};

	return (
		<>
			{shouldShowTrigger && <SidebarTrigger className="fixed top-0 left-0 z-50" />}
			<Sidebar collapsible="offcanvas" className="group group/sidebar">
				<SidebarHeader className="border-b">
					<div className="flex items-center justify-between gap-2 px-2 py-1">
						<div className="min-w-0 flex-1">
							<UserItem user={user} />
						</div>
						<div className="flex shrink-0 items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									"h-8 w-8 opacity-0 transition group-hover/sidebar:opacity-100",
									isMobile ? "opacity-100" : "opacity-0 transition group-hover/sidebar:opacity-100",
								)}
								onClick={toggleSidebar}
								title="Collapse sidebar"
							>
								<ChevronsLeft />
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8" title="Add new">
										<Plus className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent side="bottom" align="start">
									<DropdownMenuItem asChild>
										<Link to="/dashboard" className="cursor-pointer">
											<CircleUserRoundIcon className="h-4 w-4" />
											<span>New patient</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/dashboard" className="cursor-pointer">
											<AudioLinesIcon className="h-4 w-4" />
											<span>New recording</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/dashboard" className="cursor-pointer">
											<FileUpIcon className="h-4 w-4" />
											<span>Upload file</span>
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton asChild isActive={currentPath === "/dashboard"} tooltip="Home">
										<Link to="/dashboard">
											<Home className="h-4 w-4" />
											<span>Home</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									{isSearching ? (
										<div className="relative flex items-center gap-2 px-2">
											<Search className="h-4 w-4 shrink-0 text-muted-foreground" />
											<Input
												ref={searchInputRef}
												type="text"
												placeholder="Search patients..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
												onKeyDown={(e) => {
													if (e.key === "Escape") {
														handleSearchClose();
													}
												}}
											/>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 shrink-0"
												onClick={handleSearchClose}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									) : (
										<SidebarMenuButton tooltip="Search" onClick={handleSearchClick}>
											<Search className="h-4 w-4" />
											<span>Search</span>
										</SidebarMenuButton>
									)}
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupLabel>Patients</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{filteredPatients.map((patient) => {
									const isActive = currentPath === `/dashboard/${patient.id}`;
									return (
										<SidebarMenuItem key={patient.id}>
											<SidebarMenuButton asChild isActive={isActive} tooltip={patient.fullName}>
												<Link to="/dashboard/$patientId" params={{ patientId: patient.id }}>
													<span className="rounded-md border p-1 font-medium text-xs">
														{`${patient.fullName.charAt(0).toUpperCase()}.${patient.fullName.split(" ")[1].charAt(0).toUpperCase()}.`}
													</span>
													<span className="truncate">{patient.fullName}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
								{filteredPatients.length === 0 && (
									<div className="px-2 py-4 text-center text-muted-foreground text-sm">
										No patients found
									</div>
								)}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
		</>
	);
}
