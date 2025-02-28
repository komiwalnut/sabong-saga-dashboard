/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function TokenHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [totalHolders, setTotalHolders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [stats, setStats] = useState({
    totalSupply: 'Loading...',
    circulating: 'Loading...',
    transfers: 'Loading...',
    burned: 'Loading...',
    decimals: 'Loading...',
    contract: 'Loading...'
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const fetchTokenStats = useCallback(async () => {
    try {
      const response = await fetch('/api/tokenStats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats({
        totalSupply: data.totalSupply,
        circulating: data.circulating,
        transfers: data.transfers,
        burned: data.burned,
        decimals: data.decimals,
        contract: data.contract
      })
    } catch (error) {
      console.error('Stats fetch error:', error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTokenStats()
  }, [fetchTokenStats])

  const [hearts, setHearts] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  const createHeart = (x, y) => {
    const newHeart = {
      id: Date.now() + Math.random(),
      x: x - 10,
      y: y - 10,
      delay: Math.random() * 0.5
    };
    setHearts(prev => [...prev, newHeart]);
  };
  
  const createSparkle = (x, y) => {
    const newSparkle = {
      id: Date.now() + Math.random(),
      x: x - 10,
      y: y - 10
    };
    setSparkles(prev => [...prev, newSparkle]);
  };

  useEffect(() => {
    const heartTimer = setInterval(() => {
      setHearts(prev => prev.filter(heart => 
        Date.now() - heart.id < 1200
      ));
    }, 1000);
  
    const sparkleTimer = setInterval(() => {
      setSparkles(prev => prev.filter(s => 
        Date.now() - s.id < 600
      ));
    }, 500);
  
    return () => {
      clearInterval(heartTimer);
      clearInterval(sparkleTimer);
    };
  }, []);
  
  const handleCoinHover = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createHeart(x, y);
  }, []);
  
  const handleCoinClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    Array.from({ length: 8 }).forEach((_, i) => {
      const angle = (i * Math.PI) / 4;
      const x = rect.width/2 + Math.cos(angle) * 40;
      const y = rect.height/2 + Math.sin(angle) * 40;
      createHeart(x, y);
    });
    createSparkle(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = useCallback((e) => {
    const coin = e.currentTarget;
    const rect = coin.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = -(e.clientY - centerY) / 15;
    const rotateY = (e.clientX - centerX) / 15;
    
    coin.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.1)
    `;
  }, []);
  
  const handleMouseLeave = useCallback((e) => {
    const coin = e.currentTarget;
    coin.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const fetchHolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tokenHolders?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      setHolders(json.holders);
      setUpdatedAt(json.updatedAt);
      setTotalPages(json.totalPages);
      setTotalHolders(json.totalHolders);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchHolders();
  }, [fetchHolders]);

  const goToPreviousPage = useCallback(() => {
    if (page > 1) setPage(prev => prev - 1);
  }, [page]);

  const goToNextPage = useCallback(() => {
    if (page < totalPages) setPage(prev => prev + 1);
  }, [page, totalPages]);

  const handleLimitChange = useCallback((e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  }, []);

  if (error) {
    return (
      <div className="container">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchHolders}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative">
      <button
        onClick={toggleDarkMode}
        className="dark-toggle"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="text-center mb-8">
        <div className="coin-container">
          <img src="/images/cock-token.png" alt="Coin Icon" className="coin-icon" 
          onMouseMove={(e) => { 
            handleMouseMove(e); if(Math.random() > 0.7) handleCoinHover(e); 
            }} 
          onMouseLeave={handleMouseLeave} onClick={handleCoinClick} />
        
          {hearts.map(heart => (
            <div 
              key={heart.id}
              className="heart-particle"
              style={{
                left: `${heart.x}px`,
                top: `${heart.y}px`,
                animationDelay: `${heart.delay}s`,
                fontSize: `${Math.random() * 12 + 12}px`,
                color: `hsl(${Math.random() * 360}deg, 70%, 60%)`
              }}
            > ❤️
            </div>
          ))}

          {sparkles.map(sparkle => (
              <div
                key={sparkle.id}
                className="coin-sparkle"
                style={{
                  left: `${sparkle.x}px`,
                  top: `${sparkle.y}px`
                }}
              />
            ))}
        </div>
        <h2 className="dashboard-title">$COCK Holders Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Total Supply</h3>
          <p className="stat-value">{stats.totalSupply.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Circulating Supply</h3>
          <p className="stat-value">
            {typeof stats.circulating === 'number' 
              ? `${stats.circulating.toLocaleString(undefined, { 
                  maximumFractionDigits: 2 
                })}`
              : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Burned Supply</h3>
          <p className="stat-value">{stats.burned.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Holders</h3>
          <p className="stat-value">{totalHolders.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Transfers</h3>
          <p className="stat-value">{stats.transfers.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Last Updated</h3>
          <p className="stat-value">{updatedAt}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-blue-600"></div>
          <p className="loading-text mt-4">Loading data...</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Address</th>
                    <th className="table-header text-right">Balance</th>
                    <th className="table-header text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => (
                    <tr key={holder.address || index}>
                      <td className="table-cell font-mono text-sm">{holder.displayName}</td>
                      <td className="table-cell text-right">{holder.balance}</td>
                      <td className="table-cell text-right">{holder.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {holders.length > 0 && (
            <div className="pagination-container">
              <div>
                <span>Show </span>
                <select 
                  value={limit} 
                  onChange={handleLimitChange} 
                  className="pagination-btn"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span> holders</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={goToPreviousPage} 
                  disabled={page === 1} 
                  className="pagination-btn"
                >
                  &lt;
                </button>
                <span> Page {page} of {totalPages} </span>
                <button 
                  onClick={goToNextPage} 
                  disabled={page === totalPages} 
                  className="pagination-btn"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}