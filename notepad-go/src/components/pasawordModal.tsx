"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  onClose: () => void;
};

export default function PasswordModal({ slug, onClose }: Props) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!password || password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(`http://localhost:5001/user/${slug}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao definir senha");
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();

    // 🔄 RECARREGA A PÁGINA
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="font-semibold mb-4">Definir senha do slug</h2>

        <input
          type="password"
          placeholder="Senha"
          className="border p-2 w-full mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          className="border p-2 w-full mb-3"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm">
            Cancelar
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-black text-white px-3 py-1 rounded text-sm"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
