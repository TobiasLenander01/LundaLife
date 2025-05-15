"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LiaMapMarkerSolid, LiaListUlSolid  } from "react-icons/lia";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed 
        bottom-4 
        left-1/2 
        transform 
        -translate-x-1/2 
        bg-white 
        rounded-4xl 
        shadow-2xl
        shadow-gray-700
        z-50 
        px-10
        py-5
        flex
        space-x-16
        w-max
        border-2
        border-gray-300
        hover:border-gray-400
      "
    >
      <Link href="/">
        <LiaMapMarkerSolid
          className={`h-6 w-6 hover:text-blue-700 ${
            pathname === "/" ? "text-blue-500" : "text-gray-500"
          }`}
        />
      </Link>
      <Link href="/events">
        <LiaListUlSolid 
          className={`h-6 w-6 hover:text-blue-700 ${
            pathname === "/events" ? "text-blue-500" : "text-gray-500"
          }`}
        />
      </Link>
    </nav>
  );
}
