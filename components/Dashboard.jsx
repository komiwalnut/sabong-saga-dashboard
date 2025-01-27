import { useEffect, useState } from 'react';

const API_URL = 'https://skynet-api.roninchain.com/ronin/explorer/v2/tokens/0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad/top_holders';
const LIMIT = 200;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000;

export default function TokenHoldersDashboard() {
  const [holders, setHolders] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Rub your COCK to load faster.');

  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        setLoadingText((prev) => {
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
    if (!loading) {
      fetchAllHolders();
    }
  }, [loading]);

  async function fetchAllHolders() {
    const cachedData = JSON.parse(localStorage.getItem('holdersData'));
    const cacheTime = localStorage.getItem('cacheTime');
    const cacheLastUpdatedAt = localStorage.getItem('LastUpdatedAt');

    if (cachedData && cacheLastUpdatedAt && cacheTime && Date.now() - cacheTime < CACHE_EXPIRY_TIME) {
      setHolders(cachedData.holders);
      setUpdatedAt(cacheLastUpdatedAt); // Ensure updatedAt is set correctly from cache
      return;
    }

    setLoading(true);

    let offset = 0;
    let allHolders = [];
    let fetchedUpdatedAt = ''; // Add a temporary variable for the updatedAt time
    try {
      while (true) {
        const response = await fetch(`${API_URL}?limit=${LIMIT}&offset=${offset}`);
        
        if (response.status === 429) {
          console.log('Rate limit exceeded. Retrying in 3 seconds...');
          await delay(3000);
          continue;
        }

        const json = await response.json();
        if (offset === 0) {
          // Update the fetchedUpdatedAt once we get the data from the first request
          fetchedUpdatedAt = new Date(json.result.items[0].updatedAt * 1000)
            .toISOString()
            .replace('T', ' ')
            .slice(0, 16) + ' UTC';
          setUpdatedAt(fetchedUpdatedAt);
        }

        const newData = json.result.items.map(item => ({
          address: item.ownerAddress,
          balance: formatBalance(item.balance),
          percentage: formatPercentage(item.percentage),
        }));

        allHolders = [...allHolders, ...newData];

        if (offset + LIMIT >= json.result.paging.total) break;
        offset += LIMIT;

        if (offset % (LIMIT * 10) === 0) {
          await delay(2000);
        }
      }

      // Store both holders and updatedAt with cache time
      localStorage.setItem('holdersData', JSON.stringify({ holders: allHolders }));
      localStorage.setItem('cacheTime', Date.now().toString());
      localStorage.setItem('LastUpdatedAt', fetchedUpdatedAt);

      setHolders(allHolders);
      setUpdatedAt(fetchedUpdatedAt); // Update state with the new `updatedAt` value
    } catch (error) {
      console.error('Error fetching token holders:', error);
    }
    setLoading(false);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function formatBalance(balance) {
    let formattedBalance = parseFloat(balance);
  
    if (formattedBalance <= 0.0001) {
      formattedBalance = '0.0001';
    } else if (formattedBalance < 1 && formattedBalance > 0.0001) {
      formattedBalance = formattedBalance.toFixed(3);
    } else {
      formattedBalance = formattedBalance.toFixed(2);
    }

    const [integerPart, decimalPart] = formattedBalance.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  function formatPercentage(percentage) {
    let formattedPercentage = parseFloat(percentage * 100);

    if (formattedPercentage <= 0.0001) {
      formattedPercentage = '0.0001';
    } else if (formattedPercentage < 0.1 && formattedPercentage > 0.0001) {
      formattedPercentage = formattedPercentage.toFixed(4);
    } else {
      formattedPercentage = formattedPercentage.toFixed(2);
    }

    return formattedPercentage + '%';
  }

  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-[#eab547] to-[#f3d482] text-[#f0e3c2]">
      <div className="flex flex-col items-center justify-center mb-6 w-full max-w-5xl">
        <img src="/image.png" alt="Coin Icon" className="w-64 h-64 mb-4 mx-auto" />
        <h2 className="text-3xl font-bold mb-2 text-center">$COCK Holders Dashboard</h2>
        <p className="text-center mb-4">
          <b>Last Updated At</b> {updatedAt}
          <span className="text-sm ml-2" style={{ fontStyle: 'italic' }}>
            (5 mins update interval)
          </span>
        </p>
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
              <td className="border border-gray-300 px-4 py-2">{holder.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p className="text-center">{loadingText}</p>}
    </div>
  );
}
