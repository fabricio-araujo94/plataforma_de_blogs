import React from "react";
import { notFound } from "next/navigation";
import { BlockRenderer, EditorContent } from "@/components/posts/BlockRenderer";
import { LikeButton } from "@/components/interactions/LikeButton";
import { CommentsSection } from "@/components/interactions/CommentsSection";

interface PostDetail {
  id: string;
  slug: string;
  title: string;
  content: EditorContent;
  createdAt: string;
  author: {
    name: string;
    bio: string | null;
    avatarUrl: string | null;
  };
}

async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  try {
    const res = await fetch(`${apiUrl}/posts/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Erro ao buscar o post.");
    }

    return res.json();
  } catch (error: unknown) {
    console.error(`Erro ao buscar o post ${slug}:`, error);
    return null;
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
            {post.author.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">{post.author.name}</p>
            <p className="text-sm text-gray-500">
              {formattedDate} • Leitura de 5 minutos
            </p>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-4 py-4 border-y my-8">
        <LikeButton
          postId={post.id}
          initialLikes={0}
          initialUserLiked={false}
        />
      </div>

      <main>
        <BlockRenderer content={post.content} />
      </main>

      <footer className="mt-16 pt-8 border-t border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl font-bold shrink-0">
            {post.author.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Escrito por {post.author.name}
            </h3>
            {post.author.bio && (
              <p className="text-gray-600 leading-relaxed">{post.author.bio}</p>
            )}
          </div>
        </div>
      </footer>

      <CommentsSection postId={post.id} />
    </article>
  );
}
