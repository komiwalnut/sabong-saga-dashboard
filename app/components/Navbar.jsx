'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      window.location.href = '/cock-token';
    }
  }, [pathname]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/cock-token" className={`nav-link ${pathname.startsWith('/cock-token') ? 'active' : ''}`}>
          $COCK
        </Link>
        <Link href="/feather" className={`nav-link ${pathname.startsWith('/feather') ? 'active' : ''}`}>
          Feather
        </Link>
      </div>
    </nav>
  );
}