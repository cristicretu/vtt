import type { Editor } from "@tiptap/react";
import {
	Bold,
	Italic,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Table,
	TableCellsMerge,
	TableCellsSplit,
	Trash2,
	Plus,
	Minus,
	Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorToolbarProps {
	editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
	if (!editor) return null;

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="editor-toolbar">
			{/* Text formatting */}
			<div className="editor-toolbar-group">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive("bold") ? "is-active" : ""}
					title="Bold (Ctrl+B)"
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive("italic") ? "is-active" : ""}
					title="Italic (Ctrl+I)"
				>
					<Italic className="h-4 w-4" />
				</Button>
			</div>

			<div className="editor-toolbar-divider" />

			{/* Headings */}
			<div className="editor-toolbar-group">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
					title="Heading 1"
				>
					<Heading1 className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
					title="Heading 2"
				>
					<Heading2 className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
					title="Heading 3"
				>
					<Heading3 className="h-4 w-4" />
				</Button>
			</div>

			<div className="editor-toolbar-divider" />

			{/* Lists */}
			<div className="editor-toolbar-group">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive("bulletList") ? "is-active" : ""}
					title="Bullet List"
				>
					<List className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive("orderedList") ? "is-active" : ""}
					title="Numbered List"
				>
					<ListOrdered className="h-4 w-4" />
				</Button>
			</div>

			<div className="editor-toolbar-divider" />

			{/* Tables */}
			<div className="editor-toolbar-group">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={editor.isActive("table") ? "is-active" : ""}
							title="Table"
						>
							<Table className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
							}
						>
							<Plus className="h-4 w-4 mr-2" />
							Insert Table (3x3)
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().addColumnAfter().run()}
							disabled={!editor.can().addColumnAfter()}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Column
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().addRowAfter().run()}
							disabled={!editor.can().addRowAfter()}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Row
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().deleteColumn().run()}
							disabled={!editor.can().deleteColumn()}
						>
							<Minus className="h-4 w-4 mr-2" />
							Delete Column
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().deleteRow().run()}
							disabled={!editor.can().deleteRow()}
						>
							<Minus className="h-4 w-4 mr-2" />
							Delete Row
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().mergeCells().run()}
							disabled={!editor.can().mergeCells()}
						>
							<TableCellsMerge className="h-4 w-4 mr-2" />
							Merge Cells
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().splitCell().run()}
							disabled={!editor.can().splitCell()}
						>
							<TableCellsSplit className="h-4 w-4 mr-2" />
							Split Cell
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().deleteTable().run()}
							disabled={!editor.can().deleteTable()}
							className="text-destructive"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete Table
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="editor-toolbar-divider" />

			{/* Actions */}
			<div className="editor-toolbar-group">
				<Button variant="ghost" size="icon" onClick={handlePrint} title="Print">
					<Printer className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
