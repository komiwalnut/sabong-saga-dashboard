'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export default function TokenHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [totalHolders, setTotalHolders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

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
      <div className="container bg-gradient-to-b">
        <div className="text-center p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchHolders}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container bg-gradient-to-b">
      <div className="text-center">
        <Image src="/cock-token.png" alt="Coin Icon" width={128} height={128} className="coin-icon" priority />
        <h2 className="text-2xl font-bold mb-6">$COCK Holders Dashboard</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <b>Total Holders:</b> {totalHolders.toLocaleString()}
        </div>
        <div>
          <b>Last Updated At:</b> {updatedAt}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading data...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Address</th>
                  <th className="text-right p-2">Balance</th>
                  <th className="text-right p-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((holder, index) => (
                  <tr key={holder.address || index} className="border-b">
                    <td className="p-2">{holder.displayName}</td>
                    <td className="text-right p-2">{holder.balance}</td>
                    <td className="text-right p-2">{holder.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {holders.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <div>
                <span>Show </span>
                <select value={limit} onChange={handleLimitChange}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span> transfers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button 
                  onClick={goToPreviousPage} 
                  disabled={page === 1}
                  style={{ 
                    padding: '0 10px', 
                    border: '1px solid black', 
                    borderRadius: '4px', 
                    opacity: page === 1 ? 0.5 : 1,
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  &lt;
                </button>
                <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
                <button 
                  onClick={goToNextPage} 
                  disabled={page === totalPages}
                  style={{ 
                    padding: '0 10px', 
                    border: '1px solid black', 
                    borderRadius: '4px', 
                    opacity: page === totalPages ? 0.5 : 1,
                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
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