"use client";

import { format } from "date-fns";
import { Calendar, CalendarIcon, FileText, Mail, MapPin, Phone, Save, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Patient } from "~/types";

interface PatientInformationProps {
	patient: Patient;
}

export function PatientInformation({ patient }: PatientInformationProps) {
	const [editingField, setEditingField] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		fullName: patient.fullName,
		email: patient.email,
		phone: patient.phone,
		address: patient.address,
		medicalHistory: patient.medicalHistory || "",
	});
	const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(patient.dateOfBirth));

	useEffect(() => {
		setFormData({
			fullName: patient.fullName,
			email: patient.email,
			phone: patient.phone,
			address: patient.address,
			medicalHistory: patient.medicalHistory || "",
		});
		setDateOfBirth(new Date(patient.dateOfBirth));
		setEditingField(null);
	}, [patient]);

	const handleFieldClick = (fieldName: string) => {
		setEditingField(fieldName);
	};

	const handleSave = (fieldName: string) => {
		console.log(`Saving ${fieldName}:`, formData[fieldName as keyof typeof formData]);
		setEditingField(null);
	};

	const handleCancel = (fieldName: string) => {
		// Reset to original value
		setFormData({
			...formData,
			[fieldName]: patient[fieldName as keyof Patient] || "",
		});
		setEditingField(null);
	};

	const handleDateSave = () => {
		console.log("Saving date:", dateOfBirth.toISOString());
		setEditingField(null);
	};

	const handleChange = (field: string, value: string) => {
		setFormData({
			...formData,
			[field]: value,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Personal Information</CardTitle>
				<CardDescription>Basic patient details and contact information</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Full Name */}
						<div className="space-y-2">
							<Label className="font-medium text-sm">Full Name</Label>
							{editingField === "fullName" ? (
								<div className="space-y-2">
									<div className="relative">
										<User className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											value={formData.fullName}
											onChange={(e) => handleChange("fullName", e.target.value)}
											className="pl-10"
											autoFocus
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSave("fullName");
												if (e.key === "Escape") handleCancel("fullName");
											}}
										/>
									</div>
									<div className="flex gap-2">
										<Button size="sm" onClick={() => handleSave("fullName")} className="flex-1">
											<Save className="mr-2 h-3 w-3" />
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleCancel("fullName")}
											className="flex-1"
										>
											<X className="mr-2 h-3 w-3" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div
									className="group relative flex h-10 cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:border-primary hover:bg-accent"
									onClick={() => handleFieldClick("fullName")}
								>
									<User className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="flex-1 truncate">{formData.fullName}</span>
								</div>
							)}
						</div>

						{/* Date of Birth */}
						<div className="space-y-2">
							<Label className="font-medium text-sm">Date of Birth</Label>
							{editingField === "dateOfBirth" ? (
								<div className="space-y-2">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"h-10 w-full justify-start text-left font-normal text-sm",
													!dateOfBirth && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
												<span className="truncate">
													{dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
												</span>
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<CalendarComponent
												mode="single"
												selected={dateOfBirth}
												onSelect={(date) => date && setDateOfBirth(date)}
												initialFocus
												captionLayout="dropdown-buttons"
												fromYear={1900}
												toYear={new Date().getFullYear()}
											/>
										</PopoverContent>
									</Popover>
									<div className="flex gap-2">
										<Button size="sm" onClick={handleDateSave} className="flex-1">
											<Save className="mr-2 h-3 w-3" />
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												setDateOfBirth(new Date(patient.dateOfBirth));
												setEditingField(null);
											}}
											className="flex-1"
										>
											<X className="mr-2 h-3 w-3" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div
									className="group relative flex h-10 cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:border-primary hover:bg-accent"
									onClick={() => handleFieldClick("dateOfBirth")}
								>
									<Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="flex-1 truncate">{format(dateOfBirth, "MMMM d, yyyy")}</span>
								</div>
							)}
						</div>

						{/* Email */}
						<div className="space-y-2">
							<Label className="font-medium text-sm">Email Address</Label>
							{editingField === "email" ? (
								<div className="space-y-2">
									<div className="relative">
										<Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											type="email"
											value={formData.email}
											onChange={(e) => handleChange("email", e.target.value)}
											className="pl-10"
											autoFocus
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSave("email");
												if (e.key === "Escape") handleCancel("email");
											}}
										/>
									</div>
									<div className="flex gap-2">
										<Button size="sm" onClick={() => handleSave("email")} className="flex-1">
											<Save className="mr-2 h-3 w-3" />
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleCancel("email")}
											className="flex-1"
										>
											<X className="mr-2 h-3 w-3" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div
									className="group relative flex h-10 cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:border-primary hover:bg-accent"
									onClick={() => handleFieldClick("email")}
								>
									<Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="flex-1 truncate">{formData.email}</span>
								</div>
							)}
						</div>

						{/* Phone */}
						<div className="space-y-2">
							<Label className="font-medium text-sm">Phone Number</Label>
							{editingField === "phone" ? (
								<div className="space-y-2">
									<div className="relative">
										<Phone className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											type="tel"
											value={formData.phone}
											onChange={(e) => handleChange("phone", e.target.value)}
											className="pl-10"
											autoFocus
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSave("phone");
												if (e.key === "Escape") handleCancel("phone");
											}}
										/>
									</div>
									<div className="flex gap-2">
										<Button size="sm" onClick={() => handleSave("phone")} className="flex-1">
											<Save className="mr-2 h-3 w-3" />
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleCancel("phone")}
											className="flex-1"
										>
											<X className="mr-2 h-3 w-3" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div
									className="group relative flex h-10 cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:border-primary hover:bg-accent"
									onClick={() => handleFieldClick("phone")}
								>
									<Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="flex-1 truncate">{formData.phone}</span>
								</div>
							)}
						</div>

						{/* Address */}
						<div className="space-y-2 md:col-span-2">
							<Label className="font-medium text-sm">Address</Label>
							{editingField === "address" ? (
								<div className="space-y-2">
									<div className="relative">
										<MapPin className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
										<Input
											value={formData.address}
											onChange={(e) => handleChange("address", e.target.value)}
											className="pl-10"
											autoFocus
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSave("address");
												if (e.key === "Escape") handleCancel("address");
											}}
										/>
									</div>
									<div className="flex gap-2">
										<Button size="sm" onClick={() => handleSave("address")} className="flex-1">
											<Save className="mr-2 h-3 w-3" />
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleCancel("address")}
											className="flex-1"
										>
											<X className="mr-2 h-3 w-3" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div
									className="group relative flex h-10 cursor-pointer items-center gap-3 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors hover:border-primary hover:bg-accent"
									onClick={() => handleFieldClick("address")}
								>
									<MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="flex-1 truncate">{formData.address}</span>
								</div>
							)}
						</div>

						{/* Medical History */}
						<div className="space-y-2 md:col-span-2">
							<Label className="font-medium text-sm">Medical History</Label>
							{editingField === "medicalHistory" ? (
								<div className="space-y-2">
									<div className="relative">
										<FileText className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
										<Textarea
											value={formData.medicalHistory}
											onChange={(e) => handleChange("medicalHistory", e.target.value)}
											className="min-h-20 resize-none pl-10"
											autoFocus
											onKeyDown={(e) => {
												if (e.key === "Escape") handleCancel("medicalHistory");
											}}
										/>
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={() => handleSave("medicalHistory")}
											className="flex-1"
										>
											<Save className="mr-2 h-3 w-3" />
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleCancel("medicalHistory")}
											className="flex-1"
										>
											<X className="mr-2 h-3 w-3" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div
									className="group relative flex min-h-20 cursor-pointer items-start gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:border-primary hover:bg-accent"
									onClick={() => handleFieldClick("medicalHistory")}
								>
									<FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="flex-1 whitespace-pre-wrap">
										{formData.medicalHistory || "No medical history recorded"}
									</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2 pt-4 sm:flex-row">
						<Button className="flex-1">Schedule Appointment</Button>
						<Button variant="outline" className="sm:w-auto">
							View All Records
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
