"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { OutputData } from "@editorjs/editorjs";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BlockEditor } from "@/components/editor/BlockEditor";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");

  const [content, setContent] = useState<OutputData>({
    time: new Date().getTime(),
    blocks: [],
    version: "2.28.0",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (content.blocks.length === 0) {
      setError("O post não pode estar vazio.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/posts", {
        title,
        content,
        published: false,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Erro ao criar o post");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro inesperado ao salvar o post");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Novo Rascunho</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadown-sm border border-gray-100">
          <Input
            label="Título da Publicação"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite um título..."
            className="text-lg font-medium"
          />

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo
            </label>

            <BlockEditor
              initialData={content}
              onChange={(data) => setContent(data)}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Salvar Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
