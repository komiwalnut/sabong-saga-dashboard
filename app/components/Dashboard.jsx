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

  useEffect(() => {
    console.log('Initial dark mode:', isDark);
    console.log('Has dark class:', document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    console.log('Dark mode changed to:', isDark);
    console.log('HTML classes:', document.documentElement.classList.toString());
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    console.log('Toggle clicked, current state:', isDark);
    setIsDark(prev => !prev);
  }, [isDark]);

  const fetchHolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tokenHolders?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch data from the API');
      const json = await response.json();

      setHolders(json.holders);
      setUpdatedAt(json.updatedAt);
      setTotalPages(json.totalPages);
      setTotalHolders(json.totalHolders);
    } catch (error) {
      console.error('Error fetching token holders:', error);
      setError('Failed to load holders data. Please try again later.');
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
      <div className="container dark:bg-gray-800 dark:text-white">
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
    <div className="container relative bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="text-center mb-8">
        <img src="/cock-token.png" alt="Coin Icon" className="coin-icon" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 !important">
          $COCK Holders Dashboard
        </h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }} className="text-gray-700 dark:text-gray-100">
        <div>
          <b className="text-gray-900 dark:text-gray-100">Total Holders </b>
          <span className="text-gray-900 dark:text-gray-100">{totalHolders.toLocaleString()}</span>
        </div>
        <div>
          <b className="text-gray-900 dark:text-gray-100">Last Updated At </b>
          <span className="text-gray-900 dark:text-gray-100">{updatedAt}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-300">Loading data...</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr>
                  <th className="font-medium text-gray-700 dark:text-gray-200">Address</th>
                  <th className="text-right font-medium text-gray-700 dark:text-gray-200">Balance</th>
                  <th className="text-right font-medium text-gray-700 dark:text-gray-200">Percentage</th>
                </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => (
                    <tr key={holder.address || index} className="transition-colors dark:hover:bg-gray-800">
                      <td className="font-mono text-sm text-gray-900 dark:text-gray-200">{holder.displayName}</td>
                      <td className="text-right text-gray-900 dark:text-gray-200">{holder.balance}</td>
                      <td className="text-right text-gray-900 dark:text-gray-200">{holder.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {holders.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px'}} className="text-gray-900 dark:text-gray-300">
              <div>
                <span>Show </span>
                <select 
                  value={limit} 
                  onChange={handleLimitChange} 
                  className="stats-text"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span> transfers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={goToPreviousPage} disabled={page === 1} className="pagination-btn">
                  &lt;
                </button>
                <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                <button onClick={goToNextPage} disabled={page === totalPages} className="pagination-btn">
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