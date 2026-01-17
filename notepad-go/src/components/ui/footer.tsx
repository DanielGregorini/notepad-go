import Link from "next/link";

function Footer() {
  return (
    <footer className="mt-auto border-t bg-white h-64">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <span className="text-sm text-gray-600">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-900">Notepad Go</span>.  
          All rights reserved.
        </span>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900 transition"
          >
            GitHub
          </Link>

          <Link
            href="/privacy"
            className="text-gray-500 hover:text-gray-900 transition"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="text-gray-500 hover:text-gray-900 transition"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
