"use client";

interface DefinePasswordButtonProps {
  onClick: () => void;
}

export default function DefinePasswordButton({
  onClick,
}: DefinePasswordButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 rounded bg-black text-white text-sm hover:bg-gray-800"
    >
      Definir senha
    </button>
  );
}
