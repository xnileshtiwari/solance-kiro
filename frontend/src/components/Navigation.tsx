'use client';

import Link from 'next/link';
import { Plant } from '@phosphor-icons/react';

export default function Navigation() {
  return (
    <nav className="w-full px-6 py-6 flex items-center justify-center relative z-10">
      {/* Logo/Brand - Centered and Clickable */}
      <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-stone-800 hover:text-stone-600 transition-colors cursor-pointer">
        <Plant className="text-green-500" weight="fill" />
        Solance.
      </Link>
    </nav>
  );
}