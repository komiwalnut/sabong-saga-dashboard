import { useEffect, useState } from 'react';

const API_URL = 'https://skynet-api.roninchain.com/ronin/explorer/v2/tokens/0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad/top_holders';
const LIMIT = 200;

export default function TokenHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading.');

  useEffect(() => {
    fetchAllHolders();
    const interval = setInterval(() => {
      if (loading) {
        setLoadingText(prevText => {
          if (prevText.length < 11) {
            return prevText + '.';
          }
          return 'Loading.';
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  async function fetchAllHolders() {
    setLoading(true);
    let offset = 0;
    let allHolders = [];
    try {
      while (true) {
        const response = await fetch(`${API_URL}?limit=${LIMIT}&offset=${offset}`);
        const json = await response.json();
        if (offset === 0) {
          const updatedTime = new Date(json.result.items[0].updatedAt * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
          setUpdatedAt(updatedTime);
        }
        const newData = json.result.items.map(item => ({
          address: item.ownerAddress,
          balance: Math.max(parseFloat(item.balance).toFixed(2), 0.01),
          percentage: Math.max((item.percentage * 100).toFixed(4), 0.0001)
        }));
        allHolders = [...allHolders, ...newData];
        if (offset + LIMIT >= json.result.paging.total) break;
        offset += LIMIT;
      }
      setHolders(allHolders);
    } catch (error) {
      console.error('Error fetching token holders:', error);
    }
    setLoading(false);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatPercentage(percentage) {
    return parseFloat(percentage).toFixed(2) + '%';
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-[#eab547] to-[#f3d482] text-[#f0e3c2]">
      <div className="flex flex-col items-center justify-center mb-6 w-full max-w-5xl">
        <img src="/image.png" alt="Coin Icon" className="w-64 h-64 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold mb-2 text-center">$COCK Holders Dashboard</h2>
        <p className="text-center mb-4">Last Updated At: {updatedAt} | Updated every 5 mins</p>
      </div>
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
              <td className="border border-gray-300 px-4 py-2">{formatNumber(holder.balance)}</td>
              <td className="border border-gray-300 px-4 py-2">{formatPercentage(holder.percentage)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p className="text-center">{loadingText}</p>}
    </div>
  );
}
