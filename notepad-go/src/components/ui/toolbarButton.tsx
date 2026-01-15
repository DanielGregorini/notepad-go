function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.JSX.Element | string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded border text-sm ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white hover:bg-gray-100 border-gray-300"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

export default ToolbarButton;