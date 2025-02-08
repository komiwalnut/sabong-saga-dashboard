import { useEffect, useState } from 'react';

export default function TokenHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [totalHolders, setTotalHolders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHolders();
  }, [page, limit]);

  async function fetchHolders() {
    setLoading(true);
    try {
      const response = await fetch(`/api/holders?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch data from the API');
      const json = await response.json();

      setHolders(json.holders);
      setUpdatedAt(json.updatedAt);
      setTotalPages(json.totalPages);
      setTotalHolders(json.totalHolders);
    } catch (error) {
      console.error('Error fetching token holders:', error);
      alert('Failed to load holders data. Please try again later.');
    }
    setLoading(false);
  }

  function goToPreviousPage() {
    if (page > 1) setPage(page - 1);
  }

  function goToNextPage() {
    if (page < totalPages) setPage(page + 1);
  }

  function handleLimitChange(e) {
    setLimit(Number(e.target.value));
    setPage(1);
  }

  return (
    <div className="container bg-gradient-to-b">
      <img src="/image.png" alt="Coin Icon" className="coin-icon" />
      <h2>$COCK Holders Dashboard</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <b>Total Holders:</b> {totalHolders.toLocaleString()}
        </div>
        <div>
          <b>Last Updated At:</b> {updatedAt}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Balance</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {holders.map((holder, index) => (
            <tr key={index}>
              <td>{holder.displayName}</td>
              <td>{holder.balance}</td>
              <td>{holder.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {holders.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <div>
            <span>Show&nbsp;</span>
            <select value={limit} onChange={handleLimitChange}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>&nbsp;transfers</span>
          </div>
          <div>
            <button onClick={goToPreviousPage} disabled={page === 1}>&lt;</button>
            <span style={{ margin: '0 10px' }}>Page {page} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={page === totalPages}>&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
}
