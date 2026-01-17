"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  slug: string;
};

export default function ButtonDeletePassword({ slug }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = confirm(
      "Tem certeza que deseja remover a senha desta sala?"
    );
    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5001/slug/${slug}/password`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao remover senha");
      }

      // 🔄 recarrega para atualizar estado
      window.location.reload();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1 text-sm rounded border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
      type="button"
    >
      {loading ? "Removendo..." : "Remover senha"}
    </button>
  );
}
