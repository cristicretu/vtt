import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
		dateOfBirth: "",
		email: "",
		phone: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", formData);
		// Handle form submission here
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="flex h-full w-full flex-col">
			{/* Main Content */}
			<main className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-2xl">
					<Card>
						<CardHeader>
							<CardTitle>Add New Patient</CardTitle>
							<CardDescription>Enter patient information to create a new record</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="fullName">Full Name</Label>
									<Input
										id="fullName"
										name="fullName"
										placeholder="John Smith"
										value={formData.fullName}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="dateOfBirth">Date of Birth</Label>
									<Input
										id="dateOfBirth"
										name="dateOfBirth"
										type="date"
										value={formData.dateOfBirth}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="john@example.com"
										value={formData.email}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										name="phone"
										type="tel"
										placeholder="+1 (555) 123-4567"
										value={formData.phone}
										onChange={handleChange}
										required
									/>
								</div>

								<div className="flex gap-3">
									<Button type="submit" className="flex-1">
										Add Patient
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											setFormData({
												fullName: "",
												dateOfBirth: "",
												email: "",
												phone: "",
											})
										}
									>
										Clear
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
