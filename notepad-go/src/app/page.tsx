"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function generateRandomSlug() {
  return Math.random().toString(36).substring(2, 10);
}

export default function Home() {
  const router = useRouter();

  function goToRandomRoom() {
    const slug = generateRandomSlug();
    router.push(`/${slug}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-gray-900 mb-6"
        >
          Notepad Go
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-600 max-w-xl mb-10"
        >
          Um editor de texto colaborativo em tempo real.
          Crie uma sala, compartilhe o link e escreva junto — simples, rápido e seguro.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition"
          >
            Criar conta
          </Link>

          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            Entrar
          </Link>

          {/* 🔥 SALA ALEATÓRIA */}
          <button
            onClick={goToRandomRoom}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Sala aleatória
          </button>
        </motion.div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 text-center"
          >
            <div className="text-4xl mb-4">{step.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA FINAL */}
      <section className="bg-black text-white py-20 text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-4"
        >
          Comece agora
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-300 mb-8"
        >
          Não precisa instalar nada. Só abrir o link e escrever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            onClick={goToRandomRoom}
            className="inline-block px-8 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            Entrar em uma sala aleatória
          </button>
        </motion.div>
      </section>
    </main>
  );
}

const steps = [
  {
    icon: "📝",
    title: "Crie uma sala",
    description: "Cada URL é uma sala única de edição.",
  },
  {
    icon: "🔗",
    title: "Compartilhe o link",
    description: "Envie o link e escreva junto em tempo real.",
  },
  {
    icon: "🔒",
    title: "Proteja com senha",
    description: "Controle quem pode editar o conteúdo.",
  },
];
