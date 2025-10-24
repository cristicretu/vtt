import { Link, useRouter } from "@tanstack/react-router";
import { is } from "date-fns/locale";
import { ChevronsLeft, Plus, Search, User as UserIcon } from "lucide-react";
import { useState } from "react";
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
	SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "~/types";
import { patientsData } from "~/types";
import UserItem from "./user-item";

const AppSidebar = ({ user }: { user: User }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();
	const currentPath = router.state.location.pathname;
	const { isTouchDevice } = useIsMobile();

	const filteredPatients = patientsData.filter((patient) =>
		patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<Sidebar className="group group/sidebar">
			<SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
				<UserItem user={user} />
				<div className="flex flex-row items-center justify-end">
					<Button
						variant="ghost"
						size="icon"
						className={
							!isTouchDevice
								? "opacity-0 transition group-hover/sidebar:opacity-100"
								: "opacity-100"
						}
					>
						<ChevronsLeft className="h-4 w-4 shrink-0 opacity-50" />
					</Button>
					<Button variant="ghost" size="icon">
						<Plus className="h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-2 pt-4">
				<SidebarGroup>
					<SidebarGroupLabel className="font-light text-muted-foreground text-sm">
						Patients
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<div className="mb-2 px-2">
							<div className="relative">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search patients..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="h-9 pl-9"
								/>
							</div>
						</div>
						<SidebarMenu>
							{filteredPatients.map((patient) => (
								<SidebarMenuItem key={patient.id}>
									<SidebarMenuButton
										asChild
										tooltip={patient.fullName}
										isActive={currentPath === `/patients/${patient.id}`}
									>
										<Link
											to="/patients/$patientId"
											params={{ patientId: patient.id }}
											className="flex items-center gap-3"
										>
											<UserIcon className="h-4 w-4 shrink-0" />
											<span className="truncate">{patient.fullName}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							{filteredPatients.length === 0 && (
								<div className="px-4 py-6 text-center text-muted-foreground text-sm">
									No patients found
								</div>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
};

export default AppSidebar;
