import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Bell } from 'lucide-react';
import { CryptoCurrency } from '@/types/crypto';
import PriceAlertModal from './PriceAlertModal';

const formatPrice = (price: number) => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatMarketCap = (marketCap: number) => {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
};

const formatVolume = (volume: number) => {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toLocaleString()}`;
};

const PercentageChange = ({ change }: { change: number }) => {
  const isPositive = change > 0;
  const isZero = Math.abs(change) < 0.01;
  
  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isZero 
    ? 'text-gray-500' 
    : isPositive 
      ? 'text-green-600' 
      : 'text-red-600';
  
  return (
    <div className={`flex items-center gap-1 font-semibold ${colorClass}`}>
      <Icon size={16} />
      <span>{Math.abs(change).toFixed(2)}%</span>
    </div>
  );
};

interface CryptoTableProps {
  cryptos: CryptoCurrency[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function CryptoTable({ cryptos, loading, error, onRetry }: CryptoTableProps) {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    coinId: number;
    coinSymbol: string;
    coinName: string;
    currentPrice: number;
  }>({
    isOpen: false,
    coinId: 0,
    coinSymbol: '',
    coinName: '',
    currentPrice: 0
  });

  const openAlertModal = (crypto: CryptoCurrency) => {
    setAlertModal({
      isOpen: true,
      coinId: crypto.id,
      coinSymbol: crypto.symbol,
      coinName: crypto.name,
      currentPrice: crypto.quote.USD.price
    });
  };

  const closeAlertModal = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
        <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
        <button 
          onClick={onRetry} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-xl">
      <table className="w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Xếp hạng
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Tên đồng tiền
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Giá
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              1h %
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              24h %
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              7 ngày %
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Vốn hóa thị trường
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Khối lượng (24h)
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cryptos.map((crypto) => (
            <tr key={crypto.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-full">
                  {crypto.cmc_rank}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/coin/${crypto.slug}`} className="flex items-center hover:text-blue-600 transition-colors duration-200">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {crypto.name}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {crypto.symbol}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">
                {formatPrice(crypto.quote.USD.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <PercentageChange change={crypto.quote.USD.percent_change_1h} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <PercentageChange change={crypto.quote.USD.percent_change_24h} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <PercentageChange change={crypto.quote.USD.percent_change_7d} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatMarketCap(crypto.quote.USD.market_cap)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatVolume(crypto.quote.USD.volume_24h)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAlertModal(crypto);
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800 transition-colors duration-200"
                  title="Tạo cảnh báo giá"
                >
                  <Bell size={14} className="mr-1" />
                  Cảnh báo
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PriceAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlertModal}
        coinId={alertModal.coinId}
        coinSymbol={alertModal.coinSymbol}
        coinName={alertModal.coinName}
        currentPrice={alertModal.currentPrice}
      />
    </div>
  );
}