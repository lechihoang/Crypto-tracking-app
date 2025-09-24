'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CryptoCurrency } from '@/types/crypto';
import { clientApi } from '@/lib/api';
import CompareContent from '@/components/CompareContent';

export default function ComparePage() {
  const [allCryptos, setAllCryptos] = useState<CryptoCurrency[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<(CryptoCurrency | null)[]>([null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true);
        const data = await clientApi.getLatestListings(200);
        setAllCryptos(data.data);
      } catch (error) {
        console.error('Failed to fetch cryptocurrencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const handleSelectCoin = (coin: CryptoCurrency, index: number) => {
    const newSelectedCoins = [...selectedCoins];
    newSelectedCoins[index] = coin;
    setSelectedCoins(newSelectedCoins);
  };

  const handleRemoveCoin = (index: number) => {
    const newSelectedCoins = [...selectedCoins];
    newSelectedCoins[index] = null;
    setSelectedCoins(newSelectedCoins);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">So sánh tiền điện tử</h1>
          </div>
        </div>
      </header>

      <CompareContent
        allCryptos={allCryptos}
        selectedCoins={selectedCoins}
        loading={loading}
        onSelectCoin={handleSelectCoin}
        onRemoveCoin={handleRemoveCoin}
      />
    </div>
  );
}