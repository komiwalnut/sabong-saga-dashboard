/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function FeatherHoldersDashboard() {
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
      const response = await fetch(`/api/featherHolders?page=${page}&limit=${limit}`);
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
        <img src="/images/feather.png" alt="Feather Icon" className="feather-icon" />
        <h2 className="dashboard-title">Feather Holders Dashboard</h2>
      </div>

      <div className="stats-container">
        <div>
          <b>Total Holders: </b>
          <span>{totalHolders.toLocaleString()}</span>
        </div>
        <div>
          <b>Last Updated At: </b>
          <span>{updatedAt}</span>
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
                <span> transfers</span>
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