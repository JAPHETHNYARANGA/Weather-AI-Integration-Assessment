"use client";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export default function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between p-4 bg-white/70 dark:bg-green-900/70 backdrop-blur-md shadow-sm">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
        Weather AI Farming Assistant
      </h1>
      <div className="flex items-center gap-3">
        <Link href="/select-location" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition">
          Pick Location on Map
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
