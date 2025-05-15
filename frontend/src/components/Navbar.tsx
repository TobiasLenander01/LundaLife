"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LiaMapMarkerSolid, LiaCalendar } from "react-icons/lia";

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
        rounded-xl 
        shadow-2xl
        shadow-gray-700
        z-50 
        px-10
        py-6
        flex
        space-x-16
        w-max
      "
    >
      <Link href="/">
        <LiaMapMarkerSolid
          className={`h-8 w-8 hover:text-blue-700 ${
            pathname === "/" ? "text-blue-500" : "text-gray-500"
          }`}
        />
      </Link>
      <Link href="/events">
        <LiaCalendar
          className={`h-8 w-8 hover:text-blue-700 ${
            pathname === "/events" ? "text-blue-500" : "text-gray-500"
          }`}
        />
      </Link>
    </nav>
  );
}
