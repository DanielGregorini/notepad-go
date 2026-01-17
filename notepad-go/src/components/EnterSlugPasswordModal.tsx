"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  slug: string;
  onSuccess: () => void;
};

export default function EnterSlugPasswordModal({ slug, onSuccess }: Props) {
  const { saveSlugToken } = useAuth();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!password) {
      setError("Senha obrigatória");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(
      `http://localhost:5001/slug/${slug}/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Senha inválida");
      setLoading(false);
      return;
    }

    const data = await res.json();

    // 🔐 salva token DO SLUG
    saveSlugToken(slug, data.token);

    setLoading(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="font-semibold mb-4">Senha do slug</h2>

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white px-3 py-1 rounded w-full"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
