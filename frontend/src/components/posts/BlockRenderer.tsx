import React from "react";
import DOMPurify from "dompurify";
import Image from "next/image";

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

          case "image": {
            const file = block.data.file as Record<string, unknown> | undefined;
            const url = typeof file?.url === "string" ? file.url : "";
            const caption =
              typeof block.data.caption === "string" ? block.data.caption : "";
            const withBorder = block.data.withBorder === true;
            const withBackground = block.data.withBackground === true;

            if (!url) return null;

            return (
              <figure
                key={key}
                className={`my-8 flex flex-col items-center ${withBackground ? "bg-gray-50 p-6 rounded-lg" : ""}`}
              >
                <div
                  className={`relative w-full max-w-3xl overflow-hidden rounded-lg ${withBorder ? "border border-gray-200" : ""}`}
                >
                  <Image
                    src={url}
                    alt={caption || "Article image"}
                    width={800}
                    height={500}
                    className="w-full h-auto object-cover"
                    unoptimized={process.env.NODE_ENV === "development"}
                  />
                </div>
                {caption && (
                  <figcaption
                    className="mt-3 text-sm text-center text-gray-500"
                    dangerouslySetInnerHTML={{ __html: sanitize(caption) }}
                  />
                )}
              </figure>
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
