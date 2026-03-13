import React from "react";
import Link from "next/link";

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  author: {
    name: string;
  };
}

interface PostCardProps {
  post: PostSummary;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <span className="font-medium text-gray-900">{post.author.name}</span>
        <span>•</span>
        <time dateTime={post.createdAt}>{formattedDate}</time>
      </div>

      <Link href={`/post/${post.slug}`} className="block group">
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
        )}
      </Link>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded-full">Tecnologia</span>
        <span>5 minutos de leitura</span>
      </div>
    </article>
  );
}
