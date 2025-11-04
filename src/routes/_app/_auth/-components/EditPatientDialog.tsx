import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "~/convex/_generated/api";
import type { Doc, Id } from "~/convex/_generated/dataModel";

interface EditPatientDialogProps {
	patient: Doc<"patients">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditPatientDialog({ patient, open, onOpenChange }: EditPatientDialogProps) {
	const updatePatient = useMutation(api.patients.updatePatient);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		dateOfBirth: "",
		email: "",
		phone: "",
		cnp: "",
	});

	// Initialize form data when patient changes or dialog opens
	useEffect(() => {
		if (open && patient) {
			// Strip +407 prefix from phone if it exists
			const phoneDigits = patient.phone?.startsWith("+407")
				? patient.phone.slice(4)
				: patient.phone || "";

			setFormData({
				name: patient.name,
				surname: patient.surname,
				dateOfBirth: new Date(patient.dateOfBirth).toISOString().split("T")[0],
				email: patient.email || "",
				phone: phoneDigits,
				cnp: patient.cnp,
			});
		}
	}, [open, patient]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Convert date string to Unix timestamp
			const dateOfBirth = new Date(formData.dateOfBirth).getTime();

			await updatePatient({
				patientId: patient._id,
				name: formData.name,
				surname: formData.surname,
				dateOfBirth,
				email: formData.email || undefined,
				phone: formData.phone ? `+407${formData.phone}` : undefined,
				cnp: formData.cnp,
			});

			toast.success("Patient updated successfully!");
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update patient");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		// For CNP field, only allow digits
		if (name === "cnp") {
			const digitsOnly = value.replace(/\D/g, "");
			setFormData({
				...formData,
				[name]: digitsOnly,
			});
			return;
		}

		// For phone field, only allow digits (max 8)
		if (name === "phone") {
			const digitsOnly = value.replace(/\D/g, "").slice(0, 8);
			setFormData({
				...formData,
				[name]: digitsOnly,
			});
			return;
		}

		setFormData({
			...formData,
			[name]: value,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit Patient Information</DialogTitle>
					<DialogDescription>Update patient details and contact information</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="name">First Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="John"
								value={formData.name}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="surname">Surname</Label>
							<Input
								id="surname"
								name="surname"
								placeholder="Smith"
								value={formData.surname}
								onChange={handleChange}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cnp">
							CNP (Personal Numerical Code)
							<span className="ml-1 text-muted-foreground font-normal">
								- {formData.cnp.length} digits
							</span>
						</Label>
						<Input
							id="cnp"
							name="cnp"
							placeholder="1234567890123"
							value={formData.cnp}
							onChange={handleChange}
							maxLength={13}
							pattern="\d{13}"
							required
							title="CNP must be exactly 13 digits"
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
						<Label htmlFor="email">Email (Optional)</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="john@example.com"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">Phone Number (Optional)</Label>
						<div className="relative">
							<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
								+407
							</div>
							<Input
								id="phone"
								name="phone"
								type="tel"
								placeholder="12345678"
								value={formData.phone}
								onChange={handleChange}
								className="pl-14"
								maxLength={8}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
