'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
        <button 
          onClick={toggleDarkMode} 
          className="dark-toggle" 
          aria-label="Toggle dark mode"
        >
          {mounted ? (
            isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5"></div>
          )}
        </button>
      </div>
    </nav>
  );
}