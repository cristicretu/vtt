import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	Calendar,
	Clock,
	FileAudio,
	FileText,
	MoreHorizontal,
	Play,
	Stethoscope,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Entry } from "~/types";
import { loadRecording } from "./RecordingPlayer";

// Define columns for the Entry table
const columns: ColumnDef<Entry>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2"
				>
					Created At
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return (
				<div className="whitespace-nowrap text-sm">
					{date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
					})}
					<div className="text-muted-foreground text-xs">
						{date.toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "diagnostic",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="h-8 px-2"
				>
					Diagnostic
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const diagnostic = row.getValue("diagnostic") as string;
			const isNotSet = diagnostic === "Not set";
			return (
				<Badge className="rounded-sm" variant={isNotSet ? "outline" : "default"}>
					{diagnostic}
				</Badge>
			);
		},
	},
	{
		accessorKey: "transcript",
		header: "Transcript",
		cell: ({ row }) => {
			const transcript = row.getValue("transcript") as string;
			return (
				<div className="max-w-md truncate text-sm" title={transcript}>
					{transcript}
				</div>
			);
		},
	},
	{
		accessorKey: "recording",
		header: "Play",
		cell: ({ row }) => {
			const entry = row.original;

			return (
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
					onClick={() => {
						loadRecording({
							id: entry.id,
							patientId: entry.patientId,
							patientName: "Unknown Patient", // TODO: Get patient name from Convex
							recording: entry.recording,
							createdAt: entry.createdAt,
						});
					}}
				>
					<Play className="h-4 w-4" />
				</Button>
			);
		},
	},
	{
		id: "actions",
		enableHiding: false,
		header: "",
		cell: ({ row }) => {
			const entry = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(entry.id)}>
							Copy entry ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View details</DropdownMenuItem>
						<DropdownMenuItem>Edit diagnostic</DropdownMenuItem>
						<DropdownMenuItem className="text-destructive">Delete entry</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

interface PatientEntriesProps {
	entries: Entry[];
}

// Mobile card view component
function MobileEntryCard({
	entry,
	isExpanded,
	onToggleDetails,
}: {
	entry: Entry;
	isExpanded: boolean;
	onToggleDetails: () => void;
}) {
	const patient = patientsData.find((p) => p.id === entry.patientId);
	const [editingDiagnostic, setEditingDiagnostic] = React.useState(false);
	const [diagnosticValue, setDiagnosticValue] = React.useState(entry.diagnostic);

	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<CardTitle className="text-base">
							{entry.createdAt.toLocaleDateString("en-US", {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</CardTitle>
						<CardDescription className="mt-1 text-xs">
							{entry.createdAt.toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Stethoscope className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground text-xs">Diagnostic</span>
					</div>
					<Badge
						className="rounded-sm"
						variant={entry.diagnostic === "Not set" ? "outline" : "default"}
					>
						{entry.diagnostic}
					</Badge>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<FileText className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground text-xs">Transcript Preview</span>
					</div>
					<p className="line-clamp-2 text-sm leading-relaxed">{entry.transcript}</p>
				</div>
				<div className="flex flex-col gap-2 pt-1">
					<Button
						variant="ghost"
						size="sm"
						className="w-full justify-start"
						onClick={() => {
							loadRecording({
								id: entry.id,
								patientId: entry.patientId,
								patientName: patient?.fullName || "Unknown Patient",
								recording: entry.recording,
								createdAt: entry.createdAt,
							});
						}}
					>
						<Play className="mr-2 h-4 w-4" />
						Play Recording
					</Button>
					<Button variant="outline" size="sm" className="w-full" onClick={onToggleDetails}>
						{isExpanded ? "Hide Full Details" : "View Full Details"}
					</Button>
				</div>

				{/* Expanded Details Section - Shows inline with fixed height */}
				<div
					className="overflow-hidden transition-all duration-300"
					style={{
						maxHeight: isExpanded ? "1000px" : "0px",
					}}
				>
					<Separator className="my-4" />
					<div className="space-y-4">
						{/* Audio Recording Section */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FileAudio className="h-4 w-4 text-primary" />
								<h3 className="font-semibold text-sm">Recording Details</h3>
							</div>
							<div className="rounded-lg border bg-muted/30 p-3">
								<p className="break-all font-mono text-muted-foreground text-xs">
									{entry.recording}
								</p>
							</div>
						</div>

						{/* Metadata Section */}
						<div className="space-y-3">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<p className="font-medium text-xs">Created At</p>
								</div>
								<p className="text-muted-foreground text-xs">
									{entry.createdAt.toLocaleString("en-US", {
										dateStyle: "full",
										timeStyle: "short",
									})}
								</p>
							</div>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<p className="font-medium text-xs">Last Updated</p>
								</div>
								<p className="text-muted-foreground text-xs">
									{entry.updatedAt.toLocaleString("en-US", {
										dateStyle: "full",
										timeStyle: "short",
									})}
								</p>
							</div>
						</div>

						{/* Editable Diagnostic Section */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Stethoscope className="h-4 w-4 text-primary" />
									<h3 className="font-semibold text-sm">Diagnostic</h3>
								</div>
								{!editingDiagnostic && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setEditingDiagnostic(true)}
										className="h-7 px-2 text-xs"
									>
										Edit
									</Button>
								)}
							</div>
							{editingDiagnostic ? (
								<div className="space-y-2">
									<Input
										value={diagnosticValue}
										onChange={(e) => setDiagnosticValue(e.target.value)}
										placeholder="Enter diagnostic"
										className="text-sm"
									/>
									<div className="flex gap-2">
										<Button
											size="sm"
											className="flex-1"
											onClick={() => {
												console.log("Save diagnostic:", diagnosticValue);
												setEditingDiagnostic(false);
											}}
										>
											Save
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="flex-1"
											onClick={() => {
												setDiagnosticValue(entry.diagnostic);
												setEditingDiagnostic(false);
											}}
										>
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<span>{entry.diagnostic}</span>
							)}
						</div>

						{/* Full Transcript Section */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-primary" />
								<h3 className="font-semibold text-sm">Full Transcript</h3>
							</div>
							<ScrollArea className="h-[200px] w-full rounded-lg border bg-background">
								<div className="p-3">
									<p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.transcript}</p>
								</div>
							</ScrollArea>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-2 pt-2">
							<Button
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={() => navigator.clipboard.writeText(entry.id)}
							>
								Copy ID
							</Button>
							<Button variant="destructive" size="sm" className="flex-1">
								Delete
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function PatientEntries({ entries }: PatientEntriesProps) {
	const isMobile = useIsMobile();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [rowSelection, setRowSelection] = React.useState({});
	const [expandedMobileEntries, setExpandedMobileEntries] = React.useState<Set<string>>(new Set());

	const table = useReactTable({
		data: entries,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onGlobalFilterChange: setGlobalFilter,
		onRowSelectionChange: setRowSelection,
		globalFilterFn: (row, _columnId, filterValue) => {
			// Custom fuzzy search function for transcript and diagnostic columns
			const transcript = row.getValue("transcript") as string;
			const diagnostic = row.getValue("diagnostic") as string;
			const searchValue = filterValue.toLowerCase();

			return (
				transcript.toLowerCase().includes(searchValue) ||
				diagnostic.toLowerCase().includes(searchValue)
			);
		},
		state: {
			sorting,
			columnFilters,
			globalFilter,
			rowSelection,
		},
	});

	// Get the selected entry (only one row can be selected at a time for detail view)
	const selectedRows = table.getSelectedRowModel().rows;
	const selectedEntry = selectedRows.length === 1 ? selectedRows[0].original : null;

	// For mobile, we don't use selectedEntry anymore; for desktop, use selectedEntry
	const currentSelectedEntry = isMobile ? null : selectedEntry;

	// Filter entries based on global filter for mobile view
	const filteredEntries = React.useMemo(() => {
		if (!globalFilter) return entries;
		const searchValue = globalFilter.toLowerCase();
		return entries.filter(
			(entry) =>
				entry.transcript.toLowerCase().includes(searchValue) ||
				entry.diagnostic.toLowerCase().includes(searchValue),
		);
	}, [entries, globalFilter]);

	// Sort filtered entries for mobile view
	const sortedFilteredEntries = React.useMemo(() => {
		const sorted = [...filteredEntries];
		if (sorting.length > 0) {
			const { id, desc } = sorting[0];
			sorted.sort((a, b) => {
				const aValue = a[id as keyof Entry];
				const bValue = b[id as keyof Entry];
				if (aValue < bValue) return desc ? 1 : -1;
				if (aValue > bValue) return desc ? -1 : 1;
				return 0;
			});
		}
		return sorted;
	}, [filteredEntries, sorting]);

	if (isMobile) {
		return (
			<div className="w-full space-y-4">
				<Input
					placeholder="Search transcript or diagnostic..."
					value={globalFilter ?? ""}
					onChange={(event) => setGlobalFilter(event.target.value)}
					className="w-full"
				/>
				<div className="text-muted-foreground text-sm">
					{sortedFilteredEntries.length} {sortedFilteredEntries.length === 1 ? "entry" : "entries"}
				</div>

				{/* Mobile Entry Cards */}
				{sortedFilteredEntries.length > 0 ? (
					<div className="space-y-3">
						{sortedFilteredEntries.map((entry) => (
							<MobileEntryCard
								key={entry.id}
								entry={entry}
								isExpanded={expandedMobileEntries.has(entry.id)}
								onToggleDetails={() => {
									setExpandedMobileEntries((prev) => {
										const newSet = new Set(prev);
										if (newSet.has(entry.id)) {
											newSet.delete(entry.id);
										} else {
											newSet.add(entry.id);
										}
										return newSet;
									});
								}}
							/>
						))}
					</div>
				) : (
					<Card className="w-full">
						<CardContent className="py-12 text-center text-muted-foreground">
							No entries found.
						</CardContent>
					</Card>
				)}
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center gap-4">
				<Input
					placeholder="Search transcript or diagnostic..."
					value={globalFilter ?? ""}
					onChange={(event) => setGlobalFilter(event.target.value)}
					className="max-w-sm"
				/>
				<div className="ml-auto text-muted-foreground text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected
				</div>
			</div>
			<div className="overflow-hidden rounded-md border">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} className="bg-muted/50">
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className="transition-colors hover:bg-muted/50"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No entries found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Selected Entry Detail Panel */}
			{currentSelectedEntry && (
				<Card className="border-primary/20 bg-muted/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg">Entry Details</CardTitle>
								<CardDescription>ID: {currentSelectedEntry.id}</CardDescription>
							</div>
							<Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
								Close
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Audio Recording Section */}
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<FileAudio className="h-5 w-5 text-primary" />
								<h3 className="font-semibold text-base">Recording</h3>
							</div>
							<div className="rounded-lg border bg-background p-4">
								<div className="flex items-center gap-3">
									<Button
										size="icon"
										variant="outline"
										onClick={() => {
											loadRecording({
												id: selectedEntry.id,
												patientId: selectedEntry.patientId,
												patientName: "Unknown Patient", // TODO: Get patient name from Convex
												recording: selectedEntry.recording,
												createdAt: selectedEntry.createdAt,
											});
										}}
									>
										<Play className="h-4 w-4" />
									</Button>
									<div className="flex-1">
										<p className="font-mono text-muted-foreground text-sm">
											{currentSelectedEntry.recording}
										</p>
										<p className="mt-1 text-muted-foreground text-xs">
											Audio waveform visualization will appear here
										</p>
									</div>
								</div>
							</div>
						</div>

						<Separator />

						{/* Metadata Section */}
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<p className="font-medium text-sm">Created At</p>
								</div>
								<p className="text-muted-foreground text-sm">
									{currentSelectedEntry.createdAt.toLocaleString("en-US", {
										dateStyle: "full",
										timeStyle: "short",
									})}
								</p>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<p className="font-medium text-sm">Last Updated</p>
								</div>
								<p className="text-muted-foreground text-sm">
									{currentSelectedEntry.updatedAt.toLocaleString("en-US", {
										dateStyle: "full",
										timeStyle: "short",
									})}
								</p>
							</div>
						</div>

						<Separator />

						{/* Diagnostic Section */}
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Stethoscope className="h-5 w-5 text-primary" />
								<h3 className="font-semibold text-base">Diagnostic</h3>
							</div>
							<div className="rounded-sm border bg-background p-4">
								<span>{currentSelectedEntry.diagnostic}</span>
							</div>
						</div>

						<Separator />

						{/* Transcript Section */}
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-primary" />
								<h3 className="font-semibold text-base">Transcript</h3>
							</div>
							<ScrollArea className="h-[200px] w-full rounded-lg border bg-background">
								<div className="p-4">
									<p className="whitespace-pre-wrap text-sm leading-relaxed">
										{currentSelectedEntry.transcript}
									</p>
								</div>
							</ScrollArea>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="flex items-center justify-between">
				<div className="flex-1 text-muted-foreground text-sm">
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
