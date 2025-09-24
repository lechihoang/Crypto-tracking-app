'use client';

import React, { useState, useEffect } from 'react';
import CryptoTable from '@/components/CryptoTable';
import Header from '@/components/Header';
import SearchSection from '@/components/SearchSection';
import { CryptoCurrency } from '@/types/crypto';
import { clientApi } from '@/lib/api';

export default function Home() {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([]);
  const [allCryptos, setAllCryptos] = useState<CryptoCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCryptos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientApi.getLatestListings(200);
      setCryptos(data.data.slice(0, 50));
      setAllCryptos(data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch cryptocurrency data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptos();
    const interval = setInterval(fetchCryptos, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCoinClick = (coinId: number) => {
    // Find the coin with this ID and use its slug instead
    const coin = cryptos.find(c => c.id === coinId);
    if (coin && coin.slug) {
      window.location.href = `/coin/${coin.slug}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bảng xếp hạng tiền điện tử
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 text-lg">
              Giá tiền điện tử và dữ liệu thị trường theo thời gian thực
            </p>
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                • Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
            )}
          </div>
        </div>

        <SearchSection
          allCryptos={allCryptos}
          onCoinClick={handleCoinClick}
        />
        
        <CryptoTable
          cryptos={cryptos}
          loading={loading}
          error={error}
          onRetry={fetchCryptos}
        />
      </main>
    </div>
  );
}
