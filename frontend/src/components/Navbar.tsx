import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-14 m-3 bg-white rounded-2xl shadow z-50 flex items-center space-x-5">
            <Link className="text-black" href="/">Map</Link>
            <Link className="text-black" href="/events">Events</Link>
        </nav>
    );
}