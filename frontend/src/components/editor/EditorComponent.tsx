"use client";

import React, { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";

interface EditorComponentProps {
  initialData?: OutputData;
  onChange: (data: OutputData) => void;
}

export default function EditorComponent({
  initialData,
  onChange,
}: EditorComponentProps) {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        data: initialData,
        placeholder: "Start writing your story......",
        tools: {
          header: {
            class: Header as unknown as any,
            inlineToolbar: true,
          },
          list: {
            class: List as unknown as any,
            inlineToolbar: true,
          },
          paragraph: {
            class: Paragraph as unknown as any,
            inlineToolbar: true,
          },
        },
        onChange: async () => {
          try {
            const savedData = await editor.save();
            onChange(savedData);
          } catch (error) {
            console.error("Error saving editor data:", error);
          }
        },
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="editorjs"
      className="prose max-w-none w-full min-h-75 p-4 border border-gray-200 rounded-md focus:outline-none"
    />
  );
}
