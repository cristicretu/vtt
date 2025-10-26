"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	type ColumnSizingState,
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
import type { Entry } from "~/types";
import { patientsData } from "~/types";
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
		size: 60,
	},
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) => (
			<div className="font-mono text-muted-foreground text-xs">{row.getValue("id")}</div>
		),
		size: 100,
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Created At
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return (
				<div className="text-sm">
					{date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			);
		},
		size: 180,
	},
	{
		accessorKey: "updatedAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Updated At
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = row.getValue("updatedAt") as Date;
			return (
				<div className="text-sm">
					{date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			);
		},
		size: 180,
	},
	{
		accessorKey: "recording",
		header: "Recording",
		cell: ({ row }) => {
			const entry = row.original;
			const patient = patientsData.find((p) => p.id === entry.patientId);

			return (
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
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
					<Play className="h-4 w-4" />
				</Button>
			);
		},
		size: 100,
	},
	{
		accessorKey: "transcript",
		header: "Transcript",
		cell: ({ row }) => {
			const transcript = row.getValue("transcript") as string;
			return (
				<div className="max-w-[300px] truncate text-sm" title={transcript}>
					{transcript}
				</div>
			);
		},
		size: 300,
	},
	{
		accessorKey: "diagnostic",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Diagnostic
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const diagnostic = row.getValue("diagnostic") as string;
			const isNotSet = diagnostic === "Not set";
			return <Badge variant={isNotSet ? "outline" : "default"}>{diagnostic}</Badge>;
		},
		size: 250,
	},
	{
		id: "actions",
		enableHiding: false,
		size: 80,
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

export function PatientEntries({ entries }: PatientEntriesProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});

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
		onColumnSizingChange: setColumnSizing,
		enableColumnResizing: true,
		columnResizeMode: "onChange",
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
			columnSizing,
		},
	});

	// Get the selected entry (only one row can be selected at a time for detail view)
	const selectedRows = table.getSelectedRowModel().rows;
	const selectedEntry = selectedRows.length === 1 ? selectedRows[0].original : null;

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
			<div className="rounded-md border">
				<Table style={{ width: table.getTotalSize() }}>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{
												width: header.getSize(),
												position: "relative",
											}}
										>
											<div className="flex items-center">
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</div>
											{header.column.getCanResize() && (
												<button
													type="button"
													onMouseDown={header.getResizeHandler()}
													onTouchStart={header.getResizeHandler()}
													className="absolute top-0 right-0 h-full w-4 cursor-col-resize touch-none select-none bg-border opacity-0"
												/>
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{
												width: cell.column.getSize(),
											}}
										>
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

			{/* Selected Entry Detail Panel */}
			{selectedEntry && (
				<Card className="border-primary/20 bg-muted/50">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg">Entry Details</CardTitle>
								<CardDescription>ID: {selectedEntry.id}</CardDescription>
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
											const patient = patientsData.find((p) => p.id === selectedEntry.patientId);
											loadRecording({
												id: selectedEntry.id,
												patientId: selectedEntry.patientId,
												patientName: patient?.fullName || "Unknown Patient",
												recording: selectedEntry.recording,
												createdAt: selectedEntry.createdAt,
											});
										}}
									>
										<Play className="h-4 w-4" />
									</Button>
									<div className="flex-1">
										<p className="font-mono text-muted-foreground text-sm">
											{selectedEntry.recording}
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
									{selectedEntry.createdAt.toLocaleString("en-US", {
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
									{selectedEntry.updatedAt.toLocaleString("en-US", {
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
							<div className="rounded-lg border bg-background p-4">
								<Badge
									variant={selectedEntry.diagnostic === "Not set" ? "outline" : "default"}
									className="text-sm"
								>
									{selectedEntry.diagnostic}
								</Badge>
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
										{selectedEntry.transcript}
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
