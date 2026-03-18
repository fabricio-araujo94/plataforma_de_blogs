import React from "react";
import { notFound, redirect } from "next/navigation";
import { UsersTable, AdminUser } from "./components/UsersTable";
import { getUserSession, getAuthHeaders } from "@/lib/auth";

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const res = await fetch(`${apiUrl}/admin/stats`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err: unknown) {
    console.log("Error: ", err);
    return null;
  }
}

async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const res = await fetch(`${apiUrl}/admin/users`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err: unknown) {
    console.log("Error:", err);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const session = await getUserSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getAdminStats();
  const users = await getAdminUsers();

  if (!stats) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Erro ao carregar o painel. Verifique sua conexão e se você é um
        Administrador.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 border-b pb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Painel de Administração
        </h1>
        <p className="text-gray-600 mt-2">
          Visão geral do sistema e moderação da comunidade.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Usuários Cadastrados
          </span>
          <span className="text-4xl font-bold text-blue-600">
            {stats.totalUsers}
          </span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Posts Publicados
          </span>
          <span className="text-4xl font-bold text-green-600">
            {stats.totalPosts}
          </span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Comentários Ativos
          </span>
          <span className="text-4xl font-bold text-purple-600">
            {stats.totalComments}
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          Gerenciamento de Comunidade
        </h2>
        {users.length > 0 ? (
          <UsersTable initialUsers={users} />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500 italic">
            Nenhum usuário encontrado no sistema.
          </div>
        )}
      </section>
    </div>
  );
}
