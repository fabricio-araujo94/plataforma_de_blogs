interface Block {
  type: string;
  data: Record<string, unknown>;
}

interface EditorContent {
  blocks: Block[];
}

export function extractExcerpt(content: EditorContent): string | null {
  const firstParagraphBlock = content.blocks.find(
    (block) => block.type === "paragraph",
  );

  if (
    !firstParagraphBlock ||
    typeof firstParagraphBlock.data.text !== "string"
  ) {
    return null;
  }

  const plainText = firstParagraphBlock.data.text.replace(/<[^>]+>/g, "");

  if (plainText.length > 150) {
    return `${plainText.substring(0, 147)}...`;
  }

  return plainText;
}
