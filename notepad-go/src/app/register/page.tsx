"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Status = "success" | "error" | null;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const payload = {
      id: crypto.randomUUID(),
      name: formData.get("name"),
      email,
      password,
    };

    try {
      // 1️⃣ cria conta
      const registerRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!registerRes.ok) {
        const err = await registerRes.json();
        setStatus("error");
        setMessage(err.error || "Erro ao criar conta");
        return;
      }

      // 2️⃣ FAZ LOGIN (IGUAL AO LoginPage)
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setStatus("error");
        setMessage(loginData.error || "Erro ao autenticar após cadastro");
        return;
      }

      // 3️⃣ usa o MESMO login do LoginPage
      login(loginData.token, loginData.user);

      setStatus("success");
      setMessage("Conta criada e login efetuado com sucesso");

      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch {
      setStatus("error");
      setMessage("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Criar conta
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Crie sua conta para salvar e compartilhar seus textos
        </p>

        {message && status && (
          <div
            className={`mb-4 rounded-lg px-4 py-2 text-sm text-center ${
              status === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            required
            placeholder="Nome"
            className="w-full rounded-lg border px-4 py-2"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border px-4 py-2"
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Senha"
            className="w-full rounded-lg border px-4 py-2"
          />

          <button
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 text-white py-2 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}
