"use client";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ChevronsLeft, Home, Plus, Search, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { api } from "~/convex/_generated/api";
import type { User } from "~/types";
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
	const [currentlyPlayingPatientId, setCurrentlyPlayingPatientId] = useState<string | null>(null);

	// Fetch patients from Convex
	const patients = useQuery(api.patients.listPatients, { search: searchQuery || undefined }) || [];

	// Track currently playing recording's patient
	useEffect(() => {
		const checkCurrentRecording = () => {
			try {
				const stored = localStorage.getItem("vtt_current_recording");
				if (stored) {
					const recording = JSON.parse(stored);
					setCurrentlyPlayingPatientId(recording.patientId || null);
				} else {
					setCurrentlyPlayingPatientId(null);
				}
			} catch (error) {
				console.error("Failed to read current recording:", error);
			}
		};

		// Check on mount
		checkCurrentRecording();

		// Listen for storage changes
		window.addEventListener("storage", checkCurrentRecording);

		// Listen for recording changes
		const handleRecordingChange = () => {
			checkCurrentRecording();
		};
		window.addEventListener("recordingChanged", handleRecordingChange);

		// Poll for changes (as backup)
		const interval = setInterval(checkCurrentRecording, 1000);

		return () => {
			window.removeEventListener("storage", checkCurrentRecording);
			window.removeEventListener("recordingChanged", handleRecordingChange);
			clearInterval(interval);
		};
	}, []);

	// Determine if trigger should be shown
	const shouldShowTrigger = isMobile ? !openMobile : state === "collapsed";

	// Focus input when search mode is activated
	useEffect(() => {
		if (isSearching && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isSearching]);

	// Fuzzy search filter - now handled by the backend, but we keep the local filter for responsive UX
	const filteredPatients = useMemo(() => {
		if (!searchQuery.trim()) {
			return patients;
		}

		const query = searchQuery.toLowerCase();
		return patients.filter((patient) => {
			const fullName = `${patient.name} ${patient.surname}`.toLowerCase();
			// Simple fuzzy matching: check if all characters in query appear in order
			let queryIndex = 0;
			for (let i = 0; i < fullName.length && queryIndex < query.length; i++) {
				if (fullName[i] === query[queryIndex]) {
					queryIndex++;
				}
			}
			return queryIndex === query.length;
		});
	}, [searchQuery, patients]);

	const handleSearchClick = () => {
		setIsSearching(true);
	};

	const handleSearchClose = () => {
		setIsSearching(false);
		setSearchQuery("");
	};

	return (
		<>
			{shouldShowTrigger && <SidebarTrigger className="absolute top-0 left-0 z-50" />}
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
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								asChild
								title="Add new patient"
							>
								<Link to="/dashboard">
									<Plus />
								</Link>
							</Button>
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
									const isActive = currentPath === `/dashboard/${patient._id}`;
									const isPlaying = currentlyPlayingPatientId === patient._id;
									const fullName = `${patient.name} ${patient.surname}`;
									const initials = `${patient.name.charAt(0).toUpperCase()}.${patient.surname.charAt(0).toUpperCase()}.`;
									return (
										<SidebarMenuItem key={patient._id}>
											<SidebarMenuButton asChild isActive={isActive} tooltip={fullName}>
												<Link
													to="/dashboard/$patientId"
													params={{ patientId: patient._id }}
													className="flex items-center gap-2"
												>
													<span className="rounded-md border p-1 font-medium text-xs">
														{initials}
													</span>
													<span className="truncate flex-1">{fullName}</span>
													{isPlaying && (
														<Volume2 className="h-3 w-3 shrink-0 text-primary animate-pulse" />
													)}
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
