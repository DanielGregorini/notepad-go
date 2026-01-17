"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HeaderAuth() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Link
          href="/login"
          className="px-3 py-1 text-sm rounded bg-white border hover:bg-gray-100"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="px-3 py-1 text-sm rounded bg-black text-white hover:bg-gray-800"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div suppressHydrationWarning className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white cursor-pointer select-none">
        {user!.name.charAt(0).toUpperCase()}
      </div>

      {open && (
        <div className="absolute right-0 w-48 bg-white border rounded shadow-lg text-sm">
          <button
            onClick={() => router.push("/user")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100"
          >
            My profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
