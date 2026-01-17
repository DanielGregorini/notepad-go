"use client";
import { useRouter } from "next/navigation";

const ButtonRansomSlug = () => {
  const router = useRouter();

  const ransomSlug = () => {
    // create a random string
    const randomString = Math.random().toString(36).substring(2, 10);
    console.log(randomString);

    //change the route to the random string
    router.push(`/${randomString}`);
    //router.refresh();
  };

  return (
    <button
      className="p-1 bg-gray-300 rounded-xl border border-gray-500"
      onClick={ransomSlug}
    >
      Random
    </button>
  );
};

export default ButtonRansomSlug;
