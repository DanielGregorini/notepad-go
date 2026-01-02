"use client";
import { useParams } from "next/navigation";

export default function SlugPage() {
  const params = useParams();

  // slug da pagina
  const fullSlug = params.slug as string | undefined;

  return (
    <main className="min-h-96">
      <p>Slug completo:</p>
      <strong>{fullSlug}</strong>
    </main>
  );
}
