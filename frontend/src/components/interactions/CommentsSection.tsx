"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AxiosError } from "axios";
import Image from "next/image";

interface CommentAuthor {
  name: string;
  avatarUrl: string | null;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  replies?: CommentData[];
}

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${postId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [postId]);

  function addReplyRecursive(
    list: CommentData[],
    parentId: string,
    newReply: CommentData,
  ): CommentData[] {
    return list.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }

      if (comment.replies) {
        return {
          ...comment,
          replies: addReplyRecursive(comment.replies, parentId, newReply),
        };
      }

      return comment;
    });
  }

  async function handleSubmitComment(
    e: React.SyntheticEvent,
    parentId: string | null = null,
  ) {
    e.preventDefault();

    const content = parentId ? replyContent[parentId] || "" : newComment;

    if (!content.trim()) return;

    try {
      setLoading(true);

      const res = await api.post(`/posts/${postId}/comments`, {
        content,
        parentId,
      });

      const createdComment = res.data;

      if (parentId) {
        setComments((prev) =>
          addReplyRecursive(prev, parentId, createdComment),
        );

        setReplyContent((prev) => ({
          ...prev,
          [parentId]: "",
        }));
      } else {
        setComments((prev) => [createdComment, ...prev]);
        setNewComment("");
      }

      setReplyingTo(null);
    } catch (err: unknown) {
      const error = err as AxiosError;

      if (error.response?.status === 401) {
        alert("Você precisa estar logado para comentar.");
      } else {
        alert("Erro ao enviar comentário.");
      }
    } finally {
      setLoading(false);
    }
  }

  const renderComment = (comment: CommentData, isReply = false) => (
    <div
      key={comment.id}
      className={`flex gap-4 ${isReply ? "ml-12 mt-4" : "mt-6 border-b pb-6"}`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 shrink-0">
        {comment.author.avatarUrl ? (
          <Image
            src={comment.author.avatarUrl}
            alt={comment.author.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          comment.author.name.charAt(0).toUpperCase()
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">
            {comment.author.name}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

        {!isReply && (
          <button
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="text-sm text-blue-600 font-medium mt-2 hover:underline"
          >
            Responder
          </button>
        )}

        {replyingTo === comment.id && (
          <form
            onSubmit={(e) => handleSubmitComment(e, comment.id)}
            className="mt-4"
          >
            <textarea
              value={replyContent[comment.id] || ""}
              onChange={(e) =>
                setReplyContent((prev) => ({
                  ...prev,
                  [comment.id]: e.target.value,
                }))
              }
              placeholder="Escreva uma resposta..."
              className="w-full border rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
            />

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar resposta"}
              </button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 border-l-2 border-gray-100">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comentários ({comments.length})
      </h3>

      <form
        onSubmit={(e) => handleSubmitComment(e, null)}
        className="mb-8 flex gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <span className="text-gray-400">?</span>
        </div>

        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Compartilhe seus pensamentos..."
            className="w-full border rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
          />

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || loading}
              className="px-4 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Comentar"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {loading && comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Carregando comentários...
          </p>
        ) : comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <p className="text-gray-500 italic text-center py-8">
            Seja o primeiro a comentar.
          </p>
        )}
      </div>
    </section>
  );
}
