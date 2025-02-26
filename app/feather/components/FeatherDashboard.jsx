/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';

export default function FeatherHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalOwners: 'Loading...',
    quantity: 'Loading...',
    dailyActiveUsers: 'Loading...'
  });

  const fetchFeatherStats = useCallback(async () => {
    try {
      const response = await fetch('/api/featherStats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats({
        totalOwners: data.totalOwners,
        quantity: data.quantity,
        dailyActiveUsers: data.dailyActiveUsers
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  }, []);

  const fetchHolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/featherHolders?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      setHolders(json.holders);
      setTotalPages(json.totalPages);
      setTotalHolders(json.totalFeathers);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchFeatherStats();
    fetchHolders();
  }, [fetchFeatherStats, fetchHolders]);

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
      <div className="text-center mb-8">
        <div className="coin-container">
          <img src="/images/feather.gif" alt="Feather" className="feather-gif" 
          onMouseMove={(e) => { 
            handleMouseMove(e); if(Math.random() > 0.7) handleCoinHover(e); 
            }} />
        </div>
        <h2 className="dashboard-title">Feather Holders Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Quantity</h3>
          <p className="stat-value">{stats.quantity.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Total Owners</h3>
          <p className="stat-value">{stats.totalOwners.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Daily Active Users</h3>
          <p className="stat-value">{stats.dailyActiveUsers.toLocaleString()}</p>
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
                    <th className="table-header text-right">On-chain</th>
                    <th className="table-header text-right">Off-chain</th>
                    <th className="table-header text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => (
                    <tr key={holder.address || index}>
                      <td className="table-cell font-mono text-sm">{holder.displayName}</td>
                      <td className="table-cell text-right">{holder.onChain}</td>
                      <td className="table-cell text-right">{holder.offChain}</td>
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