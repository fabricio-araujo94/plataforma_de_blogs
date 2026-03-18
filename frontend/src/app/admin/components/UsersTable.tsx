"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isShadowbanned: boolean;
  createdAt: string;
}

interface UsersTableProps {
  initialUsers: AdminUser[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggleShadowban(userId: string) {
    setLoadingId(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/shadowban`);

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, isShadowbanned: res.data.isShadowbanned }
            : user,
        ),
      );
    } catch (err: unknown) {
      console.error("Error updating shadowban status:", err);
      alert("Error processing the request.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-4 font-semibold text-gray-700">Nome</th>
            <th className="p-4 font-semibold text-gray-700">Email</th>
            <th className="p-4 font-semibold text-gray-700">Papel</th>
            <th className="p-4 font-semibold text-gray-700">Status</th>
            <th className="p-4 font-semibold text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-4 text-gray-800 font-medium">{user.name}</td>
              <td className="p-4 text-gray-600">{user.email}</td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                >
                  {user.role}
                </span>
              </td>
              <td className="p-4">
                {user.isShadowbanned ? (
                  <span className="text-red-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600">
                      Shadowbanned
                    </span>
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-600">
                      Ativo
                    </span>
                  </span>
                )}
              </td>
              <td className="p-4">
                {user.role !== "ADMIN" && (
                  <button
                    onClick={() => handleToggleShadowban(user.id)}
                    disabled={loadingId === user.id}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${user.isShadowbanned ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-red-50 text-red-600 hover:bg-red-100"} disabled:opacity-50`}
                  >
                    {loadingId === user.id
                      ? "Processando..."
                      : user.isShadowbanned
                        ? "Remover Shadowban"
                        : "Aplicar Shadowban"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
