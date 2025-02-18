'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      window.location.href = '/token';
    }
  }, [pathname]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/token" className={`nav-link ${pathname.startsWith('/token') ? 'active' : ''}`}>
          Token Dashboard
        </Link>
        <Link href="/feather" className={`nav-link ${pathname.startsWith('/feather') ? 'active' : ''}`}>
          Feather Dashboard
        </Link>
      </div>
    </nav>
  );
}