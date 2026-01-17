// components/ui/Header.tsx
import Link from "next/link";
import HeaderAuth from "./HeaderAuth";

export default function Header() {
  return (
    <header className="w-full h-12 flex items-center bg-gray-200 shadow-md px-4">
      <div className="w-1/12" />

      <div className="w-10/12 text-center">
        <Link href="/" className="font-semibold">
          Notepad Go
        </Link>
      </div>

      <div className="w-1/12 flex justify-end">
        <HeaderAuth />
      </div>
    </header>
  );
}
