import {
	Document,
	Paragraph,
	TextRun,
	HeadingLevel,
	AlignmentType,
	Packer,
	Table,
	TableRow,
	TableCell,
	WidthType,
} from "docx";
import { saveAs } from "file-saver";
import type { JSONContent } from "@tiptap/react";

/**
 * Generates a DOCX file directly from TipTap JSON content
 * This preserves all content exactly as shown in the editor
 */
export async function generateDocxFromTiptap(
	tiptapContent: JSONContent,
	patientFullName: string,
	consultationDate: string,
): Promise<void> {
	const children: (Paragraph | Table)[] = [];

	// Process each node in the TipTap document
	if (tiptapContent.content) {
		for (const node of tiptapContent.content) {
			const elements = processNode(node);
			children.push(...elements);
		}
	}

	// Create the document
	const doc = new Document({
		sections: [
			{
				properties: {},
				children,
			},
		],
	});

	// Generate and download the file
	const blob = await Packer.toBlob(doc);
	const fileName = `Fisa_Pacient_${patientFullName.replace(/\s+/g, "_")}_${consultationDate.replace(/\//g, "-")}.docx`;
	saveAs(blob, fileName);
}

/**
 * Process a single TipTap node and return DOCX elements
 */
function processNode(node: JSONContent): (Paragraph | Table)[] {
	switch (node.type) {
		case "heading":
			return [createHeading(node)];
		case "paragraph":
			return [createParagraph(node)];
		case "bulletList":
			return createBulletList(node);
		case "orderedList":
			return createOrderedList(node);
		case "table":
			return [createTable(node)];
		default:
			// For unknown node types, try to extract text
			if (node.content) {
				const elements: (Paragraph | Table)[] = [];
				for (const child of node.content) {
					elements.push(...processNode(child));
				}
				return elements;
			}
			return [];
	}
}

/**
 * Create a heading paragraph from a TipTap heading node
 */
function createHeading(node: JSONContent): Paragraph {
	const level = node.attrs?.level || 1;

	let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel];
	let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;

	switch (level) {
		case 1:
			headingLevel = HeadingLevel.HEADING_1;
			alignment = AlignmentType.CENTER;
			break;
		case 2:
			headingLevel = HeadingLevel.HEADING_2;
			break;
		case 3:
			headingLevel = HeadingLevel.HEADING_3;
			break;
		default:
			headingLevel = HeadingLevel.HEADING_2;
	}

	return new Paragraph({
		children: createTextRuns(node.content || []),
		heading: headingLevel,
		alignment,
		spacing: { before: level === 1 ? 0 : 240, after: 120 },
	});
}

/**
 * Create a paragraph from a TipTap paragraph node
 */
function createParagraph(node: JSONContent): Paragraph {
	return new Paragraph({
		children: createTextRuns(node.content || []),
		spacing: { after: 120 },
	});
}

/**
 * Create bullet list items from a TipTap bulletList node
 */
function createBulletList(node: JSONContent): Paragraph[] {
	const paragraphs: Paragraph[] = [];

	if (node.content) {
		for (const listItem of node.content) {
			if (listItem.type === "listItem" && listItem.content) {
				for (const itemContent of listItem.content) {
					paragraphs.push(
						new Paragraph({
							children: createTextRuns(itemContent.content || []),
							bullet: { level: 0 },
							spacing: { after: 60 },
						}),
					);
				}
			}
		}
	}

	return paragraphs;
}

/**
 * Create ordered list items from a TipTap orderedList node
 */
function createOrderedList(node: JSONContent): Paragraph[] {
	const paragraphs: Paragraph[] = [];

	if (node.content) {
		for (const listItem of node.content) {
			if (listItem.type === "listItem" && listItem.content) {
				for (const itemContent of listItem.content) {
					paragraphs.push(
						new Paragraph({
							children: createTextRuns(itemContent.content || []),
							numbering: { reference: "default-numbering", level: 0 },
							spacing: { after: 60 },
						}),
					);
				}
			}
		}
	}

	return paragraphs;
}

/**
 * Create a table from a TipTap table node
 */
function createTable(node: JSONContent): Table {
	const rows: TableRow[] = [];

	if (node.content) {
		for (const row of node.content) {
			if (row.type === "tableRow" && row.content) {
				const cells: TableCell[] = [];

				for (const cell of row.content) {
					const isHeader = cell.type === "tableHeader";
					const cellContent: Paragraph[] = [];

					if (cell.content) {
						for (const cellChild of cell.content) {
							if (cellChild.type === "paragraph") {
								cellContent.push(
									new Paragraph({
										children: createTextRuns(cellChild.content || [], isHeader),
									}),
								);
							}
						}
					}

					if (cellContent.length === 0) {
						cellContent.push(new Paragraph({ children: [] }));
					}

					cells.push(
						new TableCell({
							children: cellContent,
							shading: isHeader ? { fill: "E0E0E0" } : undefined,
						}),
					);
				}

				rows.push(new TableRow({ children: cells }));
			}
		}
	}

	return new Table({
		rows,
		width: { size: 100, type: WidthType.PERCENTAGE },
	});
}

/**
 * Create TextRun elements from TipTap content nodes
 */
function createTextRuns(content: JSONContent[], forceStyleBold = false): TextRun[] {
	const runs: TextRun[] = [];

	for (const node of content) {
		if (node.type === "text") {
			const text = node.text || "";
			const marks = node.marks || [];

			let bold = forceStyleBold;
			let italic = false;

			for (const mark of marks) {
				if (mark.type === "bold") bold = true;
				if (mark.type === "italic") italic = true;
			}

			runs.push(
				new TextRun({
					text,
					bold,
					italics: italic,
				}),
			);
		} else if (node.type === "hardBreak") {
			runs.push(new TextRun({ break: 1 }));
		}
	}

	return runs;
}

/**
 * Extract plain text from a TipTap node
 */
function extractTextFromNode(node: JSONContent): string {
	if (node.type === "text") {
		return node.text || "";
	}

	if (node.content) {
		return node.content.map(extractTextFromNode).join("");
	}

	return "";
}
