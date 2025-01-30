import { useEffect, useState } from 'react';

export default function TokenHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Rub your COCK to load faster.');

  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        setLoadingText(prev => {
          if (prev === 'Rub your COCK to load faster.') return 'Rub your COCK to load faster..';
          else if (prev === 'Rub your COCK to load faster..') return 'Rub your COCK to load faster...';
          else return 'Rub your COCK to load faster.';
        });
      }, 500);
  
      return () => clearInterval(intervalId);
    } else {
      setLoadingText('Rub your COCK to load faster.');
    }
  }, [loading]);

  useEffect(() => {
    fetchAllHolders();
  }, []);

  async function fetchAllHolders() {
    setLoading(true);
    try {
      const response = await fetch('/api/holders');
      if (!response.ok) throw new Error('Failed to fetch data from the API');
      const json = await response.json();
  
      setHolders(json.holders);
      setUpdatedAt(json.updatedAt);
    } catch (error) {
      console.error('Error fetching token holders:', error);
      alert('Failed to load holders data. Please try again later.');
    }
    setLoading(false);
  }

  return (
    <div className="container bg-gradient-to-b from-[#eab547] to-[#f3d482] text-[#f0e3c2]">
      <img src="/image.png" alt="Coin Icon" className="coin-icon" />
      <h2>$COCK Holders Dashboard</h2>
      <p className="text-center mb-4">
        <b>Last Updated At:</b> {updatedAt}
      </p>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Balance</th>
            <th>Percentage</th>
            <th>On-chain 🪶</th>
            <th>Off-chain 🪶</th>
          </tr>
        </thead>
        <tbody>
          {holders.map((holder, index) => (
            <tr key={index}>
              <td>{holder.address}</td>
              <td>{holder.balance}</td>
              <td>{holder.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p className="text-center">{loadingText}</p>}
    </div>
  );
}
