
import ButtonRansomSlug from "./buttonRansomSlug";

function Header() {
  return (
    <header className="w-full h-12 flex items-center justify-center bg-gray-200 shadow-md">
      <h1>Notepad Go</h1>
      <ButtonRansomSlug />
    </header>
  );
}

export default Header;