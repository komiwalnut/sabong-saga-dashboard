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
    <div className="container mx-auto p-6 bg-gradient-to-b from-[#eab547] to-[#f3d482] text-[#f0e3c2]">
      <img src="/image.png" alt="Coin Icon" className="w-64 h-64 mb-4 mx-auto" />
      <h2 className="text-3xl font-bold mb-2 text-center">$COCK Holders Dashboard</h2>
      <p className="text-center mb-4"><b>Last Updated At:</b> {updatedAt}</p>
      <table className="w-full border-collapse border border-[#9f191c] text-center">
        <thead>
          <tr className="bg-[#58390f] text-[#f0e3c2]">
            <th className="border border-gray-300 px-4 py-2">Address</th>
            <th className="border border-gray-300 px-4 py-2">Balance</th>
            <th className="border border-gray-300 px-4 py-2">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {holders.map((holder, index) => (
            <tr key={index} className="bg-[#f3d482]">
              <td className="border border-gray-300 px-4 py-2">{holder.address}</td>
              <td className="border border-gray-300 px-4 py-2">{holder.balance}</td>
              <td className="border border-gray-300 px-4 py-2">{holder.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p className="text-center">{loadingText}</p>}
    </div>
  );
}
