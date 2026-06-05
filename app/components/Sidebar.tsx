"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white/70 dark:bg-green-900/70 backdrop-blur-md p-4 glass-hover rounded-r-lg hidden md:block">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="text-primary hover:text-primary-dark font-medium">
          Home
        </Link>
        <Link href="/select-location" className="text-primary hover:text-primary-dark font-medium">
          Pick Location
        </Link>
        <Link href="/weather" className="text-primary hover:text-primary-dark font-medium">
          Current Weather
        </Link>
        <Link href="/forecast" className="text-primary hover:text-primary-dark font-medium">
          Forecast
        </Link>
        <Link href="/insights" className="text-primary hover:text-primary-dark font-medium">
          Farming Insights
        </Link>
      </nav>
    </aside>
  );
}
