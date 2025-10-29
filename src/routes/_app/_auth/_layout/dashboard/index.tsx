import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/_app/_auth/_layout/dashboard/")({
	component: Dashboard,
	beforeLoad: () => ({
		title: `${siteConfig.siteTitle} - Dashboard`,
		headerTitle: "Dashboard",
		headerDescription: "Manage your patients",
	}),
});

export default function Dashboard() {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
	});
	const [dateOfBirth, setDateOfBirth] = useState<Date>();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", {
			...formData,
			dateOfBirth: dateOfBirth?.toISOString(),
		});
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleClear = () => {
		setFormData({
			fullName: "",
			email: "",
			phone: "",
		});
		setDateOfBirth(undefined);
	};

	return (
		<div className="flex h-full w-full flex-col">
			<main className="flex-1 overflow-auto p-8 md:p-4">
				<div className="mx-auto max-w-4xl">
					<Card className="border-2 shadow-lg">
						<CardHeader className="space-y-3 pb-6 md:pb-8">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 md:h-12 md:w-12">
									<User className="h-5 w-5 text-primary md:h-6 md:w-6" />
								</div>
								<div className="min-w-0">
									<CardTitle className="font-bold text-xl md:text-3xl">Add New Patient</CardTitle>
									<CardDescription className="mt-1 text-sm md:text-base">
										Create a new patient record with their essential information
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pb-6 md:pb-8">
							<form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
								<div className="grid gap-6 md:grid-cols-2 md:gap-8">
									<div className="space-y-2 md:space-y-3">
										<Label htmlFor="fullName" className="font-semibold text-sm md:text-base">
											Full Name
										</Label>
										<div className="relative">
											<User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground md:top-3.5 md:h-5 md:w-5" />
											<Input
												id="fullName"
												name="fullName"
												placeholder="John Smith"
												value={formData.fullName}
												onChange={handleChange}
												required
												className="h-11 pl-10 text-sm md:h-12 md:pl-11 md:text-base"
											/>
										</div>
									</div>

									<div className="space-y-2 md:space-y-3">
										<Label className="font-semibold text-sm md:text-base">Date of Birth</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"h-11 w-full justify-start text-left font-normal text-sm md:h-12 md:text-base",
														!dateOfBirth && "text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4 shrink-0 md:mr-3 md:h-5 md:w-5" />
													<span className="truncate">
														{dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
													</span>
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={dateOfBirth}
													onSelect={setDateOfBirth}
													initialFocus
													captionLayout="dropdown-buttons"
													fromYear={1900}
													toYear={new Date().getFullYear()}
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div className="space-y-2 md:space-y-3">
										<Label htmlFor="email" className="font-semibold text-sm md:text-base">
											Email Address
										</Label>
										<div className="relative">
											<Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground md:top-3.5 md:h-5 md:w-5" />
											<Input
												id="email"
												name="email"
												type="email"
												placeholder="john.smith@example.com"
												value={formData.email}
												onChange={handleChange}
												required
												className="h-11 pl-10 text-sm md:h-12 md:pl-11 md:text-base"
											/>
										</div>
									</div>

									<div className="space-y-2 md:space-y-3">
										<Label htmlFor="phone" className="font-semibold text-sm md:text-base">
											Phone Number
										</Label>
										<div className="relative">
											<Phone className="absolute top-3 left-3 h-4 w-4 text-muted-foreground md:top-3.5 md:h-5 md:w-5" />
											<Input
												id="phone"
												name="phone"
												type="tel"
												placeholder="+1 (555) 123-4567"
												value={formData.phone}
												onChange={handleChange}
												required
												className="h-11 pl-10 text-sm md:h-12 md:pl-11 md:text-base"
											/>
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-3 pt-2 md:flex-row md:gap-4 md:pt-4">
									<Button
										type="submit"
										size="lg"
										className="h-11 w-full text-sm md:h-12 md:flex-1 md:text-base"
									>
										Add Patient
									</Button>
									<Button
										type="button"
										variant="outline"
										size="lg"
										onClick={handleClear}
										className="h-11 w-full text-sm md:h-12 md:w-auto md:text-base"
									>
										Clear Form
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
