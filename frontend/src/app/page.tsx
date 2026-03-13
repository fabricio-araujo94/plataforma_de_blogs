import React from "react";
import { PostCard, PostSummary } from "@/components/posts/PostCard";

async function getRecentPosts(): Promise<PostSummary[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  try {
    const res = await fetch(`${apiUrl}/posts`, { next: { revalidate: 60 } });

    if (!res.ok) {
      throw new Error("Failed to find posts.");
    }

    return res.json();
  } catch (err: unknown) {
    console.error("Error in requesting posts:", err);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getRecentPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <main className="lg:col-span-8">
          <div className="border-b border-gray-200 pb-4 mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          </div>

          <div className="space-y-2">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                Nenhum artigo publicado ainda.
              </div>
            )}
          </div>

          {posts.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-center">
              <button className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Carregar mais
              </button>
            </div>
          )}
        </main>

        <aside className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-8 space-y-10">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Destaques da Equipe
              </h3>
              <ul className="text-sm">
                <li className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-gray-900 hover:text-blue-600 block mb-1"
                  >
                    Como a arquitetura Clean Architecture salva projetos de
                    longo prazo
                  </a>
                  <span className="text-gray-500">Fulano</span>
                </li>
                <li className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-gray-900 hover:text-blue-600 block mb-1"
                  >
                    Otimizando queries no PostgreSQL com índices trgm
                  </a>
                  <span className="text-gray-500">Ciclano</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Tópicos Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Tecnologia",
                  "Programação",
                  "Carreira",
                  "Node.js",
                  "Next.js",
                  "Design",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
