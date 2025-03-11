'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cockPrice, setCockPrice] = useState(null);
  const [featherPrice, setFeatherPrice] = useState(null);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('darkMode', newValue.toString());
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setIsDark(savedMode === 'true');
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
      localStorage.setItem('darkMode', systemPrefersDark.toString());
    }
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

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/assetPrices');
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          console.error("API error:", data.error, data.message);
          return;
        }
        
        if (data.cockPrice !== null && data.cockPrice !== undefined) {
          setCockPrice(data.cockPrice);
        } else {
          console.log("No valid COCK price in response:", data);
        }
        
        if (data.featherPrice !== null && data.featherPrice !== undefined) {
          setFeatherPrice(data.featherPrice);

        } else {
          console.log("No valid Feather price in response:", data);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const formattedCockPrice = cockPrice !== null 
    ? `${parseFloat(cockPrice).toFixed(4)} USD` 
    : <span className="loading-price">Loading...</span>;
    
  const formattedFeatherPrice = featherPrice !== null 
    ? `${parseFloat(featherPrice).toFixed(3)} RON` 
    : <span className="loading-price">Loading...</span>;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/cock-token" className={`nav-link ${pathname.startsWith('/cock-token') ? 'active' : ''}`}>
          $COCK
        </Link>
        <Link href="/feather" className={`nav-link ${pathname.startsWith('/feather') ? 'active' : ''}`}>
          Feather
        </Link>
        
        <div className="price-info">
          <a 
            href="https://app.roninchain.com/swap?outputCurrency=0x8FD6b3FA81ADf438FEeb857E0b8aEd5f74f718ad#/swap" 
            target="_blank" 
            rel="noopener noreferrer"
            className="price-display-link"
          >
            <span className="price-display">
              <span className="price-symbol">1 COCK =</span>
              <span className="price-value">{formattedCockPrice}</span>
            </span>
          </a>
          <a 
            href="https://marketplace.roninchain.com/collections/sabong-saga-game-items/1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="price-display-link"
          >
            <span className="price-display">
              <span className="price-symbol">1 Feather =</span>
              <span className="price-value">{formattedFeatherPrice}</span>
            </span>
          </a>
        </div>
        
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