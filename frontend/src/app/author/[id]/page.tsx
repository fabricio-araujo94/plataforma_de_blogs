import React from "react";
import { notFound } from "next/navigation";
import { PostCard, PostSummary } from "@/components/posts/PostCard";
import Image from "next/image";

interface AuthorProfile {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  posts: PostSummary[];
}

async function getAuthorProfile(
  authorId: string,
): Promise<AuthorProfile | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  try {
    const res = await fetch(`${apiUrl}/authors/${authorId}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("");
    }

    return res.json();
  } catch (err: unknown) {
    console.error(``, err);
    return null;
  }
}

export default async function AuthorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const author = await getAuthorProfile(params.id);

  if (!author) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <section className="flex flex-col items-center text-center bg-gray-50 rounded-2xl p-8 mb-12 shadow-sm">
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt={`Avatar de ${author.name}`}
            className="w-24 h-24 rounded-full object-cover mb-4 border-white shadow"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>

        {author.bio ? (
          <p className="text-gray-600 max-w-2xl text-lg">{author.bio}</p>
        ) : (
          <p className="text-gray-500 italic">
            Este autor ainda não escreveu uma biografia.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Publicações de {author.name}
        </h2>

        {author.posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {author.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
              Nenhum artigo publicado ainda.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
