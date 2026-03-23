"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface DashboardPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    views: number;
    likes: number;
    comments: number;
  };
}

interface AuthorPostsTableProps {
  initialPosts: DashboardPost[];
}

export function AuthorPostsTable({ initialPosts }: AuthorPostsTableProps) {
  const [activeTab, setActiveTab] = useState<"published" | "drafts">(
    "published",
  );

  const filteredPosts = initialPosts.filter((post) =>
    activeTab === "published" ? post.published : "post.published",
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 pt-4">
        <button
          onClick={() => setActiveTab("published")}
          className={`pb-4 px-2 mr-6 font-medium text-sm transition-colors relative ${
            activeTab === "published"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Publicados
          {activeTab === "published" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
            activeTab === "drafts"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Rascunhos
          {activeTab === "drafts" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {post.title || "Sem título"}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Última edição em{" "}
                  {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <strong className="text-gray-900">
                      {post._count.views}
                    </strong>{" "}
                    Views
                  </span>
                  <span className="flex items-center gap-1">
                    <strong className="text-gray-900">
                      {post._count.likes}
                    </strong>{" "}
                    Likes
                  </span>
                  <span className="flex items-center gap-1">
                    <strong className="text-gray-900">
                      {post._count.comments}
                    </strong>{" "}
                    Comentários
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {post.published && (
                  <Link
                    href={`/post/${post.slug}`}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Ver
                  </Link>
                )}
                <Link
                  href={`/post/edit/${post.id}`}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Editar
                </Link>

                {post.published ? (
                  <button className="px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors">
                    Arquivar
                  </button>
                ) : (
                  <button className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>Nenhum post encontrado nesta categoria.</div>
        )}
      </div>
    </div>
  );
}
