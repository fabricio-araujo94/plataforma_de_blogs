"use client";

import dynamic from "next/dynamic";

export const BlockEditor = dynamic(() => import("./EditorComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-75 p-4 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Carregando editor...</p>
    </div>
  ),
});
