import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserSession, getAuthHeaders } from "@/lib/auth";
import { AuthorPostsTable, DashboardPost } from "./components/AuthorPostsTable";

async function getMyPosts(): Promise<DashboardPost[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  try {
    const res = await fetch(`${apiUrl}/posts/me`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("");
    }
    return res.json();
  } catch (err: unknown) {
    console.error(err);
    return [];
  }
}

export default async function AuthorDashboardPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  const posts = await getMyPosts();

  const totalViews = posts.reduce((acc, post) => acc + post._count.views, 0);
  const totalLikes = posts.reduce((acc, post) => acc + post._count.likes, 0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            O Meu Painel
          </h1>
          <p className="text-gray-600">
            Gere as suas histórias, rascunhos e analise o seu alcance.
          </p>
        </div>
        <Link
          href="/posts/new"
          className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Escrever Nova História
        </Link>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Visualizações Totais
            </p>
            <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Likes Recebidos</p>
            <p className="text-2xl font-bold text-gray-900">{totalLikes}</p>
          </div>
        </div>
      </section>

      <section>
        <AuthorPostsTable initialPosts={posts} />
      </section>
    </main>
  );
}
