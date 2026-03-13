import React from "react";
import DOMPurify from "dompurify";

export interface BlockData {
  id?: string;
  type: string;
  data: Record<string, unknown>;
}

export interface EditorContent {
  time?: number;
  version?: string;
  blocks: BlockData[];
}

interface BlockRendererProps {
  content: EditorContent;
}

export function BlockRenderer({ content }: BlockRendererProps) {
  if (!content || !Array.isArray(content.blocks)) {
    return null;
  }

  const sanitize = (html: string) => DOMPurify.sanitize(html);

  return (
    <div className="prose prose-lg prose-blue max-w-none text-gray-800">
      {content.blocks.map((block, index) => {
        const key = block.id || `block-${index}`;

        switch (block.type) {
          case "paragraph": {
            const text =
              typeof block.data.text === "string" ? block.data.text : "";

            return (
              <p
                key={key}
                dangerouslySetInnerHTML={{ __html: sanitize(text) }}
                className="mb-6 leading-relaxed"
              />
            );
          }

          case "header": {
            const text =
              typeof block.data.text === "string" ? block.data.text : "";

            const level =
              typeof block.data.level === "number"
                ? Math.min(Math.max(block.data.level, 1), 6)
                : 2;

            type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            const Tag = `h${level}` as HeadingTag;

            return (
              <Tag
                key={key}
                dangerouslySetInnerHTML={{ __html: sanitize(text) }}
                className="font-bold mt-8 mb-4 text-gray-900"
              />
            );
          }

          case "list": {
            const style = block.data.style === "ordered" ? "ol" : "ul";

            const items = Array.isArray(block.data.items)
              ? block.data.items
              : [];

            const ListTag = style as "ol" | "ul";

            return (
              <ListTag
                key={key}
                className={`mb-6 pl-8 ${
                  style === "ol" ? "list-decimal" : "list-disc"
                }`}
              >
                {items.map((item, i) => {
                  const itemText = typeof item === "string" ? item : "";

                  return (
                    <li
                      key={`${key}-item-${i}`}
                      dangerouslySetInnerHTML={{
                        __html: sanitize(itemText),
                      }}
                      className="mb-2"
                    />
                  );
                })}
              </ListTag>
            );
          }

          default:
            console.warn(
              `Block type "${block.type}" is not supported by BlockRenderer.`,
            );
            return null;
        }
      })}
    </div>
  );
}
