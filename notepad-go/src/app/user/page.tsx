"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Slug = {
  slug: string;
};

export default function UserPage() {
  const { user, token, logout, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [slugs, setSlugs] = useState<Slug[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* =======================
     Proteção básica
  ======================= */
  useEffect(() => {
    if (!user || !token) {
      window.location.href = "/";
    }
  }, [user, token]);

  /* =======================
     Sync formulário ← user
  ======================= */
  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  /* =======================
     Carregar slugs
  ======================= */
  useEffect(() => {
    if (!user) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/slugs`)
      .then((res) => res.json())
      .then(setSlugs)
      .catch(() => setSlugs([]));
  }, [user]);

  /* =======================
     Salvar perfil
  ======================= */
  async function handleSave() {
    setError(null);
    setSuccess(null);

    if (password && password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${user!.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password: password || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar perfil");
      }

      // ✅ atualiza context + localStorage
      updateUser(data.user);

      setPassword("");
      setConfirm("");
      setSuccess("Perfil atualizado com sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const avatarLetter = user.name.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow p-6 space-y-8">
        {/* PERFIL */}
        <section className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
            {avatarLetter}
          </div>

          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </section>

        {/* EDITAR PERFIL */}
        <section>
          <h2 className="font-semibold mb-4">Edit profile</h2>

          <div className="space-y-3 max-w-md">
            <input
              className="border p-2 w-full rounded"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="border p-2 w-full rounded"
              placeholder="Nova senha (opcional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              className="border p-2 w-full rounded"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && (
              <p className="text-green-600 text-sm">{success}</p>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded text-sm"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>

            <button
              onClick={logout}
              className="text-sm text-gray-500 underline block"
            >
              Logout
            </button>
          </div>
        </section>

        {/* SALAS */}
        <section>
          <h2 className="font-semibold mb-3">My rooms</h2>

          {slugs.length === 0 && (
            <p className="text-sm text-gray-500">
              You don&apos;t have any rooms.
            </p>
          )}

          <ul className="space-y-2">
            {slugs.map((s) => (
              <li
                key={s.slug}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span className="font-mono">{s.slug}</span>

                <Link
                  href={`/${s.slug}`}
                  className="text-sm text-blue-600 underline"
                >
                  Entrar
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
