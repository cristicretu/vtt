import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { EditorToolbar } from "./EditorToolbar";
import "./editor.css";

export interface TiptapEditorRef {
	getContent: () => JSONContent | null;
}

interface TiptapEditorProps {
	content: JSONContent;
	onUpdate: (content: JSONContent) => void;
	debounceMs?: number;
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(function TiptapEditor(
	{ content, onUpdate, debounceMs = 1000 },
	ref,
) {
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const lastContentRef = useRef<string>("");

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false, // We'll use the dedicated heading extension
				bulletList: false,
				orderedList: false,
			}),
			Heading.configure({
				levels: [1, 2, 3],
			}),
			BulletList,
			OrderedList,
			Table.configure({
				resizable: true,
			}),
			TableRow,
			TableCell,
			TableHeader,
			Image.configure({
				inline: false,
				allowBase64: true,
			}),
			Placeholder.configure({
				placeholder: "Începeți să scrieți documentul medical...",
			}),
		],
		content,
		editorProps: {
			attributes: {
				class: "prose prose-sm max-w-none focus:outline-none",
			},
		},
		onUpdate: ({ editor }) => {
			const json = editor.getJSON();
			const jsonString = JSON.stringify(json);

			// Only trigger update if content actually changed
			if (jsonString !== lastContentRef.current) {
				lastContentRef.current = jsonString;

				// Debounce the update
				if (debounceTimerRef.current) {
					clearTimeout(debounceTimerRef.current);
				}

				debounceTimerRef.current = setTimeout(() => {
					onUpdate(json);
				}, debounceMs);
			}
		},
	});

	// Expose getContent method via ref
	useImperativeHandle(
		ref,
		() => ({
			getContent: () => editor?.getJSON() ?? null,
		}),
		[editor],
	);

	// Update editor content when prop changes (initial load)
	useEffect(() => {
		if (editor && content) {
			const currentContent = JSON.stringify(editor.getJSON());
			const newContent = JSON.stringify(content);

			if (currentContent !== newContent && newContent !== lastContentRef.current) {
				lastContentRef.current = newContent;
				editor.commands.setContent(content);
			}
		}
	}, [editor, content]);

	// Cleanup debounce timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	return (
		<div className="tiptap-editor border border-border rounded-lg shadow-sm">
			<EditorToolbar editor={editor} />
			<div className="editor-content-wrapper bg-white dark:bg-zinc-900">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
});
