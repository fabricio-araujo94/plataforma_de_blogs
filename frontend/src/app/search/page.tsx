import React from "react";
import { PostCard, PostSummary } from "@/components/posts/PostCard";

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  authorName: string;
  rank: number;
}

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  if (!query) return [];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  try {
    const res = await fetch(
      `${apiUrl}/posts/search?q=${encodeURIComponent(query)}`,
      { cache: "no-store" },
    );

    if (!res.ok) throw new Error("Error retrieving results.");

    return res.json();
  } catch (err: unknown) {
    console.error("Search error: ", err);
    return [];
  }
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const results = await fetchSearchResults(query);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resultados da Pesquisa
        </h1>
        {query ? (
          <p className="text-gray-600">
            Mostrando resultados para{" "}
            <span className="font-semibold text-gray-900">{query}</span>
          </p>
        ) : (
          <p className="text-gray-600">
            Favor, introduzir um termo para pesquisar.
          </p>
        )}
      </header>

      <section>
        {results.length > 0 ? (
          <div className="flex flex-col gap-6">
            {results.map((result) => {
              const postSummary: PostSummary = {
                id: result.id,
                slug: result.slug,
                title: result.title,
                excerpt: result.excerpt,
                createdAt: result.createdAt,
                author: { name: result.authorName },
              };

              return <PostCard key={result.id} post={postSummary} />;
            })}
          </div>
        ) : (
          query && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum artigo encontrado.
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Não conseguimos encontrar nada que corresponda a "{query}".
                Verifique a ortografia ou tente outras palavras-chave.
              </p>
            </div>
          )
        )}
      </section>
    </main>
  );
}
