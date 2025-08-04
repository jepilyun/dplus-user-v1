import Link from "next/link";

export default function TopNavMain() {
  return (
    <nav className="flex justify-between items-center text-white p-6 px-12">
      <Link href="/">
        <div className="font-logo">Trand</div>
      </Link>
    </nav>
  );
}
