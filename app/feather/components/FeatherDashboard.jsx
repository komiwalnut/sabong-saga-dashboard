/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, useCallback } from 'react';

export default function FeatherHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalOwners: 'Loading...',
    quantity: 'Loading...',
    burned: 'Loading...',
    claimable: 'Loading...',
    totalWithdraws: 'Loading...'
  });

  const fetchFeatherStats = useCallback(async () => {
    try {
      const response = await fetch('/api/featherStats');
      
      if (!response.ok) {
        setStats({
          totalOwners: 'Error',
          quantity: 'Error',
          burned: 'Error',
          claimable: 'Error',
          totalWithdraws: 'Error'
        });
        return;
      }
      
      const data = await response.json();
      
      setStats({
        totalOwners: data.totalOwners,
        quantity: data.quantity,
        burned: data.burned,
        claimable: data.claimable,
        totalWithdraws: data.totalWithdraws
      });
    } catch (error) {
      setStats({
        totalOwners: 'Error',
        quantity: 'Error',
        burned: 'Error',
        claimable: 'Error',
        totalWithdraws: 'Error'
      });
    }
  }, []);

  const fetchHolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/featherHolders?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const json = await response.json();
      
      if (!json.holders || json.holders.length === 0) {
        setHolders([
          {
            address: 'No data available',
            displayName: 'No data available',
            balance: '0'
          }
        ]);
        setTotalPages(1);
      } else {
        setHolders(json.holders);
        setTotalPages(json.totalPages || 1);
        setUpdatedAt(json.updatedAt || '');
      }
    } catch (error) {
      setError('Failed to load data');
      setHolders([
        {
          address: 'Error loading data',
          displayName: 'Error loading data',
          balance: '0'
        }
      ]);
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

  const formatDisplayValue = (value) => {
    if (value === 'Loading...' || value === 'Error') return value;
    if (typeof value === 'number') return value.toLocaleString();
    return '0';
  };

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
          <img 
            src="/images/feather.gif" 
            alt="Feather" 
            className="feather-icon" 
          />
        </div>
        <h2 className="feather-dashboard-title">Feather Holders Dashboard</h2>
      </div>

      <div className="feather-stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Quantity (On-Chain)</h3>
          <p className="stat-value">{formatDisplayValue(stats.quantity)}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Burned Supply</h3>
          <p className="stat-value">{formatDisplayValue(120*8888)}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Total Owners</h3>
          <p className="stat-value">{formatDisplayValue(stats.totalOwners)}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Claimable</h3>
          <p className="stat-value">{formatDisplayValue(stats.claimable)}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Total Withdraws</h3>
          <p className="stat-value">{formatDisplayValue(stats.totalWithdraws)}</p>
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
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => (
                    <tr key={holder.address || index}>
                      <td className="table-cell font-mono text-sm">{holder.displayName}</td>
                      <td className="table-cell text-right">{holder.balance}</td>
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